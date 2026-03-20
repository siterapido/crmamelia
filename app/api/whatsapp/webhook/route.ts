/**
 * Evolution API Webhook Handler
 * Processes incoming messages and status updates from Evolution API
 * Documentation: https://doc.evolution-api.com/
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts, conversations, messages } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { sendTextMessage, fetchProfilePicture } from '@/lib/whatsapp/evolution-client'
import { processSDRMessage } from '@/lib/ai/sdr-agent'
import { executeSDRActions, ensureDeal } from '@/lib/ai/sdr-actions'

const FALLBACK_MESSAGE = 'Olá! Desculpe, estou com uma instabilidade temporária. Um atendente humano vai te responder em breve. 🙏'

// Validate critical env vars at module load
const REQUIRED_ENV_VARS = ['EVOLUTION_API_URL', 'EVOLUTION_API_KEY', 'EVOLUTION_INSTANCE_NAME', 'OPENROUTER_API_KEY'] as const
for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
        console.error(`[Webhook] ⚠️ CRITICAL: Missing environment variable ${envVar} — the AI agent will NOT work.`)
    }
}
if (process.env.EVOLUTION_API_URL?.includes('localhost')) {
    console.warn('[Webhook] ⚠️ WARNING: EVOLUTION_API_URL points to localhost. This will NOT work in production/Vercel.')
}

// ==================== GET: Webhook verification ====================
// Note: Evolution API typically doesn't require a challenge for verification 
// like Meta, but we'll keep it for compatibility if needed.
export async function GET() {
    return NextResponse.json({ status: 'Evolution API webhook active' })
}

// ==================== POST: Receive messages ====================

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json()
        const eventType = payload.event
        const instance = payload.instance

        console.log(`[Webhook] Received event: ${eventType} | Instance: ${instance}`)

        if (eventType === 'messages.upsert') {
            const messageData = payload.data
            const message = messageData.message
            const pushName = messageData.pushName || 'WhatsApp User'
            const key = messageData.key
            const remoteJid = key.remoteJid
            const phone = remoteJid.split('@')[0]

            console.log(`[Webhook] Message from ${phone} (${pushName}): ${JSON.stringify(message).slice(0, 100)}`)

            if (key.fromMe) {
                 console.log(`[Webhook] Ignoring outbound message from ${phone}`)
                 return NextResponse.json({ status: 'ignored_outbound' })
            }

            const messageContent = extractEvolutionMessageContent(message)
            const messageType = message.imageMessage ? 'image' : 
                                message.videoMessage ? 'video' : 
                                message.documentMessage ? 'document' : 'text'

            console.log(`[Webhook] Content: ${messageContent.slice(0, 50)}... | Type: ${messageType}`)

            // For debugging, we await this. In production with high volume, consider background task.
            try {
                await handleInboundMessage(phone, remoteJid, pushName, messageContent, messageType, key.id)
                console.log(`[Webhook] Successfully processed message from ${phone}`)
            } catch (err) {
                console.error(`[Webhook] Error processing message from ${phone}:`, err)
            }
        }

        if (eventType === 'messages.update') {
            const data = payload.data
            console.log(`[Webhook] Message update: ${data.key.id} | Status: ${data.status}`)
            const statusMap: Record<string, string> = {
                'PENDING': 'sent',
                'SERVER_ACK': 'delivered',
                'DELIVERY_ACK': 'delivered',
                'READ': 'read',
                'PLAYED': 'read',
                'ERROR': 'failed'
            }

            const statusId = data.key.id
            const newStatus = statusMap[data.status] || data.status

            if (statusId) {
                await db
                    .update(messages)
                    .set({ status: newStatus })
                    .where(eq(messages.whatsappMessageId, statusId))
            }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error) {
        console.error('[Webhook] Major error:', error)
        return NextResponse.json({ status: 'error' }, { status: 500 })
    }
}

// ==================== Handlers ====================

async function handleInboundMessage(
    phone: string, 
    whatsappId: string, 
    senderName: string, 
    messageContent: string, 
    messageType: string,
    whatsappMessageId: string
) {
    console.log(`[Handler] Processing ${phone} | MsgId: ${whatsappMessageId}`)
    
    // 1. Upsert contact
    console.log(`[Handler] Finding contact for ${phone}...`)
    let [contact] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.phone, phone))
        .limit(1)

    if (!contact) {
        console.log(`[Handler] Contact not found. Creating new contact for ${senderName} (${phone})...`)
        const [newContact] = await db
            .insert(contacts)
            .values({
                name: senderName,
                phone,
                whatsappId,
                source: 'whatsapp',
                status: 'new',
                lastContactAt: new Date(),
            })
            .returning()
        contact = newContact
        console.log(`[Handler] Created contact ID: ${contact.id}`)

        // Auto-create deal in pipeline for new contacts
        try {
            await ensureDeal(contact)
        } catch (err) {
            console.error(`[Handler] Failed to create deal for new contact:`, err)
        }

        // Fetch profile picture for new contact
        try {
            const picUrl = await fetchProfilePicture(phone)
            if (picUrl) {
                await db.update(contacts).set({ profilePictureUrl: picUrl }).where(eq(contacts.id, contact.id))
                contact = { ...contact, profilePictureUrl: picUrl }
            }
        } catch {
            // Non-critical, ignore
        }
    } else {
        console.log(`[Handler] Found contact ID: ${contact.id}. Updating last contact info...`)
        await db
            .update(contacts)
            .set({
                lastContactAt: new Date(),
                updatedAt: new Date(),
                ...(senderName !== phone && senderName !== 'WhatsApp User' ? { name: senderName } : {}),
            })
            .where(eq(contacts.id, contact.id))

        // Ensure deal exists for returning contacts too
        try {
            await ensureDeal(contact)
        } catch (err) {
            console.error(`[Handler] Failed to ensure deal:`, err)
        }

        // Fetch profile picture if missing
        if (!contact.profilePictureUrl) {
            try {
                const picUrl = await fetchProfilePicture(phone)
                if (picUrl) {
                    await db.update(contacts).set({ profilePictureUrl: picUrl }).where(eq(contacts.id, contact.id))
                    contact = { ...contact, profilePictureUrl: picUrl }
                }
            } catch {
                // Non-critical, ignore
            }
        }
    }

    // 2. Find or create active conversation
    console.log(`[Handler] Finding active conversation for contact ${contact.id}...`)
    let [conversation] = await db
        .select()
        .from(conversations)
        .where(and(eq(conversations.contactId, contact.id), eq(conversations.status, 'active')))
        .orderBy(desc(conversations.createdAt))
        .limit(1)

    if (!conversation) {
        console.log(`[Handler] Active conversation not found. Creating new one...`)
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
        console.log(`[Handler] Created conversation ID: ${conversation.id}`)
    } else {
        console.log(`[Handler] Found conversation ID: ${conversation.id}`)
        await db
            .update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, conversation.id))
    }

    // 3. Save inbound message
    console.log(`[Handler] Saving message: ${messageContent.slice(0, 30)}...`)
    await db.insert(messages).values({
        conversationId: conversation.id,
        whatsappMessageId: whatsappMessageId,
        direction: 'inbound',
        sender: 'contact',
        content: messageContent,
        messageType,
        status: 'read',
    })

    // 4. Route to AI agent if enabled
    console.log(`[Handler] AI enabled: ${conversation.aiEnabled}`)
    if (conversation.aiEnabled) {
        try {
            // Auto-move to "contacted" if still "new"
            if (contact.status === 'new') {
                await db.update(contacts).set({ status: 'contacted', updatedAt: new Date() }).where(eq(contacts.id, contact.id))
                const { executeSDRActions: exec } = await import('@/lib/ai/sdr-actions')
                await exec([{ type: 'update_stage', stage: 'contacted' }], contact, conversation.id)
                console.log(`[CRM] Auto-moved contact ${contact.id} from "new" → "contacted"`)
            }

            console.log(`[AI] Processing message with agent...`)
            const history = await db
                .select()
                .from(messages)
                .where(eq(messages.conversationId, conversation.id))
                .orderBy(desc(messages.createdAt))
                .limit(20)

            // Re-fetch contact to get latest data (may have been updated by previous interactions)
            const [freshContact] = await db.select().from(contacts).where(eq(contacts.id, contact.id)).limit(1)

            const result = await processSDRMessage(
                conversation.id,
                messageContent,
                history.reverse(),
                freshContact || contact
            )

            console.log(`[AI] Agent reply: ${result.reply ? 'YES' : 'NO'} | Actions: ${result.actions.length}`)

            if (result.actions.length > 0) {
                console.log(`[AI] Executing ${result.actions.length} actions...`)
                await executeSDRActions(result.actions, freshContact || contact, conversation.id)
            }

            if (result.reply) {
                await sendAndSaveReply(phone, result.reply, conversation.id, true)
            }
        } catch (aiError) {
            console.error('[AI] ❌ Agent error:', aiError instanceof Error ? aiError.message : aiError)
            console.error('[AI] Stack:', aiError instanceof Error ? aiError.stack : 'N/A')

            // Send fallback message so the user isn't left without a response
            try {
                console.log(`[AI] Sending fallback message to ${phone}...`)
                await sendAndSaveReply(phone, FALLBACK_MESSAGE, conversation.id, true)
            } catch (fallbackError) {
                console.error('[AI] ❌ Even fallback message failed:', fallbackError instanceof Error ? fallbackError.message : fallbackError)
                console.error('[AI] This likely means EVOLUTION_API_URL is unreachable. Current URL:', process.env.EVOLUTION_API_URL)
            }
        }
    }
}

/**
 * Helper: send a message and save it to the DB in one step
 */
async function sendAndSaveReply(
    phone: string,
    text: string,
    conversationId: string,
    aiGenerated: boolean
) {
    console.log(`[Send] Sending to ${phone} via Evolution API (${process.env.EVOLUTION_API_URL})...`)
    const response = await sendTextMessage(phone, text)
    console.log(`[Send] Evolution API response: ${JSON.stringify(response)}`)
    const wamid = response?.key?.id || null

    await db.insert(messages).values({
        conversationId,
        whatsappMessageId: wamid,
        direction: 'outbound',
        sender: aiGenerated ? 'ai' : 'agent',
        content: text,
        messageType: 'text',
        status: 'sent',
        aiGenerated,
    })

    await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversationId))
}

function extractEvolutionMessageContent(message: any): string {
    if (!message) return '[Mensagem]'

    // Support text, images, videos, etc based on Evolution API structure
    if (message.conversation) return message.conversation
    if (message.extendedTextMessage) return message.extendedTextMessage.text
    if (message.imageMessage) return message.imageMessage.caption || '[Imagem]'
    if (message.videoMessage) return message.videoMessage.caption || '[Vídeo]'
    if (message.documentMessage) return message.documentMessage.caption || `[Documento: ${message.documentMessage.fileName || 'arquivo'}]`
    if (message.audioMessage) return '[Áudio]'
    if (message.stickerMessage) return '[Figurinha]'
    if (message.contactMessage) return `[Contato: ${message.contactMessage.displayName}]`
    if (message.locationMessage) return `[Localização: ${message.locationMessage.degreesLatitude}, ${message.locationMessage.degreesLongitude}]`
    
    return '[Mensagem]'
}
