/**
 * Meta WhatsApp Cloud API Webhook
 * GET  - Webhook verification challenge from Meta
 * POST - Receive messages and status updates from Meta
 * https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts, conversations, messages } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { verifyWebhookChallenge, verifyWebhookSignature } from '@/lib/whatsapp/verify'
import { markMessageAsRead, sendTextMessage } from '@/lib/whatsapp/client'
import { processSDRMessage } from '@/lib/ai/sdr-agent'
import { executeSDRActions } from '@/lib/ai/sdr-actions'
import type {
    MetaWebhookPayload,
    MetaWebhookMessage,
    MetaWebhookStatus,
} from '@/lib/whatsapp/types'

// ==================== GET: Webhook verification ====================

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    const verified = verifyWebhookChallenge(mode, token, challenge)
    if (verified) {
        return new NextResponse(verified, { status: 200 })
    }

    console.error('Webhook verification failed', { mode, token })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ==================== POST: Receive messages ====================

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text()

        // Verify Meta signature
        const signature = request.headers.get('x-hub-signature-256')
        if (!verifyWebhookSignature(rawBody, signature)) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload: MetaWebhookPayload = JSON.parse(rawBody)

        // Only process whatsapp_business_account events
        if (payload.object !== 'whatsapp_business_account') {
            return NextResponse.json({ status: 'ok' })
        }

        // Process each entry and change
        for (const entry of payload.entry) {
            for (const change of entry.changes) {
                if (change.field !== 'messages') continue

                const value = change.value

                // Handle inbound messages
                if (value.messages?.length) {
                    for (const msg of value.messages) {
                        const contact = value.contacts?.find(c => c.wa_id === msg.from)
                        const senderName = contact?.profile.name || msg.from

                        // Process async to avoid webhook timeout
                        handleInboundMessage(msg, senderName).catch(err =>
                            console.error('Error processing inbound message:', err)
                        )
                    }
                }

                // Handle message status updates
                if (value.statuses?.length) {
                    for (const status of value.statuses) {
                        handleStatusUpdate(status).catch(err =>
                            console.error('Error handling status update:', err)
                        )
                    }
                }
            }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ status: 'ok' }) // Always 200 to Meta
    }
}

// ==================== Handlers ====================

async function handleStatusUpdate(status: MetaWebhookStatus) {
    const statusMap: Record<string, string> = {
        sent: 'sent',
        delivered: 'delivered',
        read: 'read',
        failed: 'failed',
    }

    await db
        .update(messages)
        .set({ status: statusMap[status.status] || status.status })
        .where(eq(messages.whatsappMessageId, status.id))
}

async function handleInboundMessage(msg: MetaWebhookMessage, senderName: string) {
    const phone = msg.from
    const messageContent = extractMessageContent(msg)
    const messageType = msg.type === 'unknown' ? 'text' : msg.type

    // 1. Upsert contact
    let [contact] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.phone, phone))
        .limit(1)

    if (!contact) {
        const [newContact] = await db
            .insert(contacts)
            .values({
                name: senderName,
                phone,
                whatsappId: phone,
                source: 'whatsapp',
                status: 'new',
                lastContactAt: new Date(),
            })
            .returning()
        contact = newContact
    } else {
        await db
            .update(contacts)
            .set({
                lastContactAt: new Date(),
                updatedAt: new Date(),
                ...(senderName !== phone ? { name: senderName } : {}),
            })
            .where(eq(contacts.id, contact.id))
    }

    // 2. Find or create active conversation
    let [conversation] = await db
        .select()
        .from(conversations)
        .where(and(eq(conversations.contactId, contact.id), eq(conversations.status, 'active')))
        .orderBy(desc(conversations.createdAt))
        .limit(1)

    if (!conversation) {
        const [newConv] = await db
            .insert(conversations)
            .values({
                contactId: contact.id,
                status: 'active',
                aiEnabled: true,
                lastMessageAt: new Date(),
            })
            .returning()
        conversation = newConv
    } else {
        await db
            .update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, conversation.id))
    }

    // 3. Save inbound message
    await db.insert(messages).values({
        conversationId: conversation.id,
        whatsappMessageId: msg.id,
        direction: 'inbound',
        sender: 'contact',
        content: messageContent,
        messageType,
        status: 'sent',
    })

    // 4. Mark as read
    try {
        await markMessageAsRead(msg.id)
    } catch {
        // Non-critical
    }

    // 5. Route to AI agent if enabled
    if (conversation.aiEnabled) {
        try {
            const history = await db
                .select()
                .from(messages)
                .where(eq(messages.conversationId, conversation.id))
                .orderBy(desc(messages.createdAt))
                .limit(20)

            const result = await processSDRMessage(
                conversation.id,
                messageContent,
                history.reverse(),
                contact
            )

            if (result.actions.length > 0) {
                await executeSDRActions(result.actions, contact, conversation.id)
            }

            if (result.reply) {
                const waResponse = await sendTextMessage(phone, result.reply)
                const wamid = waResponse.messages?.[0]?.id ?? null

                await db.insert(messages).values({
                    conversationId: conversation.id,
                    whatsappMessageId: wamid,
                    direction: 'outbound',
                    sender: 'ai',
                    content: result.reply,
                    messageType: 'text',
                    status: 'sent',
                    aiGenerated: true,
                })

                await db
                    .update(conversations)
                    .set({ lastMessageAt: new Date() })
                    .where(eq(conversations.id, conversation.id))
            }
        } catch (aiError) {
            console.error('AI agent error:', aiError)
        }
    }
}

function extractMessageContent(msg: MetaWebhookMessage): string {
    switch (msg.type) {
        case 'text':
            return msg.text?.body ?? '[Mensagem]'
        case 'image':
            return msg.image?.caption ? msg.image.caption : '[Imagem]'
        case 'document':
            return msg.document?.caption ?? `[Documento: ${msg.document?.filename ?? 'arquivo'}]`
        case 'audio':
            return '[Áudio]'
        case 'video':
            return msg.video?.caption ? msg.video.caption : '[Vídeo]'
        case 'location':
            return `[Localização: ${msg.location?.name ?? `${msg.location?.latitude},${msg.location?.longitude}`}]`
        case 'contacts':
            return `[Contato: ${msg.contacts?.[0]?.name.formatted_name ?? 'Contato'}]`
        case 'sticker':
            return '[Figurinha]'
        case 'interactive':
            return msg.interactive?.button_reply?.title ?? msg.interactive?.list_reply?.title ?? '[Interação]'
        default:
            return '[Mensagem]'
    }
}
