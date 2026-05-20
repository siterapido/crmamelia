/**
 * Evolution API Webhook Handler
 * Processes incoming messages and status updates from Evolution API
 * Documentation: https://doc.evolution-api.com/
 */

import { after, NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts, conversations, messages } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { sendTextMessage, fetchProfilePicture, sendPresence } from '@/lib/whatsapp/evolution-client'
import { normalizePhone } from '@/lib/whatsapp/client'
import { processSDRMessage } from '@/lib/ai/sdr-agent'
import { executeSDRActions, ensureDeal } from '@/lib/ai/sdr-actions'

export const maxDuration = 60

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

export async function GET() {
    return NextResponse.json({ status: 'Evolution API webhook active' })
}

// ==================== POST: Receive messages ====================

export async function POST(request: NextRequest) {
    let payload
    try {
        payload = await request.json()
    } catch {
        console.error('[Webhook] Failed to parse JSON payload')
        return NextResponse.json({ status: 'invalid_payload' }, { status: 400 })
    }

    const eventType = payload.event
    const instance = payload.instance

    console.log(`[Webhook] Received event: ${eventType} | Instance: ${instance}`)

    try {
        if (eventType === 'messages.upsert') {
            const messageData = payload.data
            const key = messageData?.key
            const message = messageData?.message

            if (!key?.remoteJid || !message) {
                console.error('[Webhook] Invalid messages.upsert payload: missing key or message')
                return NextResponse.json({ status: 'invalid_payload' }, { status: 400 })
            }

            const pushName = messageData.pushName || 'WhatsApp User'
            const remoteJid = key.remoteJid as string
            const phone = remoteJid.split('@')[0].split(':')[0]

            console.log(`[Webhook] Message from ${phone} (${pushName}) | Key ID: ${key.id}`)

            if (key.fromMe) {
                console.log(`[Webhook] Ignoring outbound message from ${phone}`)
                return NextResponse.json({ status: 'ignored_outbound' })
            }

            const messageContent = extractEvolutionMessageContent(message)
            const messageType = message.imageMessage
                ? 'image'
                : message.videoMessage
                  ? 'video'
                  : message.documentMessage
                    ? 'document'
                    : 'text'

            console.log(`[Webhook] Content: ${messageContent.slice(0, 50)}... | Type: ${messageType}`)

            after(async () => {
                try {
                    await handleInboundMessage(
                        phone,
                        remoteJid,
                        pushName,
                        messageContent,
                        messageType,
                        key.id as string
                    )
                    console.log(`[Webhook] ✅ Processed message from ${phone}`)
                } catch (err) {
                    console.error(
                        `[Webhook] ❌ Error processing message from ${phone}:`,
                        err instanceof Error ? err.message : err
                    )
                }
            })
        }

        if (eventType === 'messages.update') {
            const data = payload.data
            const messageId = data?.keyId || data?.key?.id
            console.log(`[Webhook] Message update: ${messageId} | Status: ${data?.status}`)

            if (messageId) {
                const statusMap: Record<string, string> = {
                    PENDING: 'sent',
                    SERVER_ACK: 'delivered',
                    DELIVERY_ACK: 'delivered',
                    READ: 'read',
                    PLAYED: 'read',
                    ERROR: 'failed',
                }
                const newStatus = statusMap[data.status] || data.status

                try {
                    await db
                        .update(messages)
                        .set({ status: newStatus })
                        .where(eq(messages.whatsappMessageId, messageId))
                } catch (err) {
                    console.error('[Webhook] Failed to update message status:', err)
                }
            }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error) {
        console.error('[Webhook] Major error:', error)
        return NextResponse.json({ status: 'received' }, { status: 200 })
    }
}

// ==================== Handlers ====================

async function updateProfilePictureAsync(contactId: string, phone: string) {
    try {
        const picUrl = await fetchProfilePicture(phone)
        if (picUrl) {
            await db
                .update(contacts)
                .set({ profilePictureUrl: picUrl })
                .where(eq(contacts.id, contactId))
        }
    } catch {
        // Non-critical
    }
}

async function handleInboundMessage(
    phone: string,
    whatsappId: string,
    senderName: string,
    messageContent: string,
    messageType: string,
    whatsappMessageId: string
) {
    console.log(`[Handler] Processing ${phone} | MsgId: ${whatsappMessageId}`)

    let contactId: string
    let conversationId: string | undefined

    try {
        // 1. Upsert contact
        console.log(`[Handler] Finding contact for ${phone}...`)
        let [contact] = await db
            .select()
            .from(contacts)
            .where(eq(contacts.phone, phone))
            .limit(1)

        if (!contact) {
            console.log(`[Handler] Creating new contact for ${senderName} (${phone})...`)
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

            try {
                await ensureDeal(contact)
            } catch (err) {
                console.error(`[Handler] Failed to create deal for new contact:`, err)
            }

            void updateProfilePictureAsync(contact.id, phone)
        } else {
            console.log(`[Handler] Found contact ID: ${contact.id}`)
            await db
                .update(contacts)
                .set({
                    whatsappId,
                    lastContactAt: new Date(),
                    updatedAt: new Date(),
                    ...(senderName !== phone && senderName !== 'WhatsApp User' ? { name: senderName } : {}),
                })
                .where(eq(contacts.id, contact.id))

            try {
                await ensureDeal(contact)
            } catch (err) {
                console.error(`[Handler] Failed to ensure deal:`, err)
            }

            if (!contact.profilePictureUrl) {
                void updateProfilePictureAsync(contact.id, phone)
            }
        }
        contactId = contact.id

        // 2. Find or create active conversation
        console.log(`[Handler] Finding active conversation for contact ${contactId}...`)
        let [conversation] = await db
            .select()
            .from(conversations)
            .where(and(eq(conversations.contactId, contactId), eq(conversations.status, 'active')))
            .orderBy(desc(conversations.createdAt))
            .limit(1)

        if (!conversation) {
            const [newConv] = await db
                .insert(conversations)
                .values({
                    contactId,
                    status: 'active',
                    aiEnabled: true,
                    lastMessageAt: new Date(),
                    lastInboundAt: new Date(),
                })
                .returning()
            conversation = newConv
            console.log(`[Handler] Created conversation ID: ${conversation.id}`)
        } else {
            await db
                .update(conversations)
                .set({
                    lastMessageAt: new Date(),
                    lastInboundAt: new Date(),
                    flowState: 'active',
                })
                .where(eq(conversations.id, conversation.id))
        }
        conversationId = conversation.id
        const aiEnabled = conversation.aiEnabled

        // 3. Save inbound message
        try {
            await db.insert(messages).values({
                conversationId,
                whatsappMessageId,
                direction: 'inbound',
                sender: 'contact',
                content: messageContent,
                messageType,
                status: 'read',
            })
        } catch (err) {
            console.error('[Handler] ❌ Failed to save inbound message:', err)
        }

        // 4. Route to AI agent if enabled
        console.log(`[Handler] AI enabled: ${aiEnabled}`)
        if (!aiEnabled) {
            console.log('[Handler] AI disabled for this conversation, skipping')
            return
        }

        await runSDRAgent(contactId, conversationId, whatsappId, phone, messageContent)
    } catch (err) {
        console.error('[Handler] ❌ Pipeline error:', err instanceof Error ? err.message : err)
        if (conversationId) {
            await sendFallback(whatsappId, conversationId, phone)
        }
        throw err
    }
}

async function runSDRAgent(
    contactId: string,
    conversationId: string,
    whatsappId: string,
    phone: string,
    messageContent: string
) {
    try {
        const [contactCheck] = await db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1)

        if (contactCheck?.status === 'new') {
            await db
                .update(contacts)
                .set({ status: 'contacted', updatedAt: new Date() })
                .where(eq(contacts.id, contactId))
            await executeSDRActions(
                [{ type: 'update_stage', stage: 'contacted' }],
                contactCheck,
                conversationId
            )
            console.log(`[CRM] Auto-moved contact ${contactId} from "new" → "contacted"`)
        }

        void sendPresence(phone, 'composing')

        console.log(`[AI] Processing message with agent...`)

        const history = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(desc(messages.createdAt))
            .limit(20)

        const [freshContact] = await db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1)
        const contact = freshContact || contactCheck

        if (!contact) {
            throw new Error(`Contact ${contactId} not found`)
        }

        const result = await processSDRMessage(
            conversationId,
            messageContent,
            history.reverse(),
            contact
        )

        console.log(`[AI] Agent reply: ${result.reply ? 'YES' : 'NO'} | Actions: ${result.actions.length}`)

        if (result.actions.length > 0) {
            await executeSDRActions(result.actions, contact, conversationId)
        }

        await sendAndSaveReply(whatsappId, result.reply, conversationId, true)
    } catch (aiError) {
        console.error('[AI] ❌ Agent error:', aiError instanceof Error ? aiError.message : aiError)
        await sendFallback(whatsappId, conversationId, phone)
    }
}

async function sendFallback(whatsappId: string, conversationId: string, phone: string) {
    try {
        console.log(`[AI] Sending fallback message to ${phone}...`)
        await sendAndSaveReply(whatsappId, FALLBACK_MESSAGE, conversationId, true)
    } catch (fallbackError) {
        console.error(
            '[AI] ❌ Even fallback message failed:',
            fallbackError instanceof Error ? fallbackError.message : fallbackError
        )
        console.error('[AI] EVOLUTION_API_URL:', process.env.EVOLUTION_API_URL)
    }
}

async function sendAndSaveReply(
    whatsappId: string,
    text: string,
    conversationId: string,
    aiGenerated: boolean
) {
    const number = normalizePhone(whatsappId)
    console.log(`[Send] Sending to ${number} via Evolution API (${process.env.EVOLUTION_API_URL})...`)
    const response = await sendTextMessage(number, text)
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

function extractEvolutionMessageContent(message: Record<string, unknown>): string {
    if (!message) return '[Mensagem]'

    if (message.conversation) return String(message.conversation)
    const extended = message.extendedTextMessage as { text?: string } | undefined
    if (extended?.text) return extended.text
    const image = message.imageMessage as { caption?: string } | undefined
    if (image) return image.caption || '[Imagem]'
    const video = message.videoMessage as { caption?: string } | undefined
    if (video) return video.caption || '[Vídeo]'
    const doc = message.documentMessage as { caption?: string; fileName?: string } | undefined
    if (doc) return doc.caption || `[Documento: ${doc.fileName || 'arquivo'}]`
    if (message.audioMessage) return '[Áudio]'
    if (message.stickerMessage) return '[Figurinha]'
    const contactMsg = message.contactMessage as { displayName?: string } | undefined
    if (contactMsg) return `[Contato: ${contactMsg.displayName}]`
    const location = message.locationMessage as { degreesLatitude?: number; degreesLongitude?: number } | undefined
    if (location) {
        return `[Localização: ${location.degreesLatitude}, ${location.degreesLongitude}]`
    }

    return '[Mensagem]'
}
