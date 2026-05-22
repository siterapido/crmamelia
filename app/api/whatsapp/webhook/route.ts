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

const FALLBACK_MESSAGE =
    'Olá! Desculpe, estou com uma instabilidade temporária. Um atendente humano vai te responder em breve. 🙏'

const REQUIRED_ENV_VARS = [
    'EVOLUTION_API_URL',
    'EVOLUTION_API_KEY',
    'EVOLUTION_INSTANCE_NAME',
    'OPENROUTER_API_KEY',
] as const
for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
        console.error(
            `[Webhook] ⚠️ CRITICAL: Missing environment variable ${envVar} — the AI agent will NOT work.`
        )
    }
}
if (process.env.EVOLUTION_API_URL?.includes('localhost')) {
    console.warn(
        '[Webhook] ⚠️ WARNING: EVOLUTION_API_URL points to localhost. This will NOT work in production/Vercel.'
    )
}

// ==================== GET: Webhook verification ====================

export async function GET() {
    return NextResponse.json({ status: 'Evolution API webhook active' })
}

// ==================== POST: Receive messages ====================

function normalizeWebhookEvent(event: string | undefined): string {
    if (!event) return ''
    const e = event.toLowerCase().replace(/_/g, '.')
    if (e === 'messages.upsert') return 'messages.upsert'
    if (e === 'messages.update') return 'messages.update'
    return e
}

function isReplyableJid(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@c.us')
}

function jidToPhone(jid: string | undefined): string | null {
    if (!jid || jid.includes('@lid')) return null
    const local = jid.split('@')[0].split(':')[0]
    const digits = local.replace(/\D/g, '')
    return digits.length >= 10 ? digits : null
}

function resolveReplyJid(jid: string | undefined): string | null {
    if (!jid || jid.includes('@lid')) return null
    return isReplyableJid(jid) ? jid : null
}

function resolveContactFromUpsert(
    messageData: Record<string, unknown>,
    payload: Record<string, unknown>
): { phone: string; replyJid: string } | null {
    const key = messageData.key as
        | {
              remoteJid?: string
              remoteJidAlt?: string
              participant?: string
              fromMe?: boolean
              id?: string
          }
        | undefined
    if (!key?.remoteJid) return null

    const candidates: string[] = [
        key.remoteJid,
        key.remoteJidAlt,
        messageData.remoteJidAlt as string | undefined,
        payload.sender as string | undefined,
        messageData.sender as string | undefined,
        key.participant,
    ].filter((v): v is string => typeof v === 'string')

    let replyJid: string | null = null
    for (const candidate of candidates) {
        replyJid = resolveReplyJid(candidate)
        if (replyJid) break
    }

    if (!replyJid) {
        console.error(
            '[Webhook] LID unresolved — no @s.whatsapp.net JID:',
            key.remoteJid,
            'alt:',
            key.remoteJidAlt ?? messageData.remoteJidAlt,
            'sender:',
            payload.sender
        )
        return null
    }

    const phone = jidToPhone(replyJid)
    if (!phone) {
        console.error('[Webhook] Could not extract phone from JID:', replyJid)
        return null
    }

    return { phone, replyJid }
}

function collectUpsertMessages(data: unknown): Record<string, unknown>[] {
    if (!data) return []
    if (Array.isArray(data)) return data as Record<string, unknown>[]
    return [data as Record<string, unknown>]
}

export async function POST(request: NextRequest) {
    let payload: Record<string, unknown>
    try {
        payload = await request.json()
    } catch {
        console.error('[Webhook] Failed to parse JSON payload')
        return NextResponse.json({ status: 'invalid_payload' }, { status: 400 })
    }

    const eventType = normalizeWebhookEvent(payload.event as string | undefined)
    const instance = payload.instance as string | undefined
    const expectedInstance = process.env.EVOLUTION_INSTANCE_NAME

    console.log(`[Webhook] Received event: ${payload.event} → ${eventType} | Instance: ${instance}`)

    if (expectedInstance && instance && instance !== expectedInstance) {
        console.warn(`[Webhook] Instance mismatch: got ${instance}, expected ${expectedInstance}`)
    }

    let persistFailures = 0
    let persistedCount = 0
    const skipped: { reason: string; remoteJid?: string }[] = []

    try {
        if (eventType === 'messages.upsert') {
            const items = collectUpsertMessages(payload.data)
            if (items.length === 0) {
                console.error('[Webhook] Invalid messages.upsert: empty data')
                return NextResponse.json({ status: 'invalid_payload' }, { status: 400 })
            }

            for (const messageData of items) {
                const key = messageData.key as
                    | { remoteJid?: string; fromMe?: boolean; id?: string }
                    | undefined
                const message = messageData.message as Record<string, unknown> | undefined

                if (!key?.remoteJid || !message) {
                    console.error('[Webhook] Skipping upsert item: missing key or message')
                    continue
                }

                if (key.fromMe) {
                    console.log(`[Webhook] Ignoring outbound message ${key.id}`)
                    continue
                }

                const resolved = resolveContactFromUpsert(messageData, payload)
                if (!resolved) {
                    const remoteJid = key.remoteJid
                    skipped.push({
                        reason: remoteJid?.includes('@lid') ? 'lid_unresolved' : 'contact_unresolved',
                        remoteJid,
                    })
                    continue
                }

                const { phone, replyJid } = resolved
                const pushName = (messageData.pushName as string) || 'WhatsApp User'
                const messageContent = extractEvolutionMessageContent(message)
                const messageType = message.imageMessage
                    ? 'image'
                    : message.videoMessage
                      ? 'video'
                      : message.documentMessage
                        ? 'document'
                        : 'text'
                const whatsappMessageId = (key.id as string) || `unknown-${Date.now()}`

                console.log(
                    `[Webhook] Inbound ${phone} (${pushName}) | replyJid: ${replyJid} | ${messageContent.slice(0, 50)}`
                )

                try {
                    const ctx = await persistInboundMessage(
                        phone,
                        replyJid,
                        pushName,
                        messageContent,
                        messageType,
                        whatsappMessageId
                    )
                    persistedCount++
                    console.log(`[Webhook] ✅ Persisted inbound from ${phone} (conv ${ctx.conversationId})`)

                    if (ctx.aiEnabled) {
                        after(async () => {
                            try {
                                await runSDRAgent(
                                    ctx.contactId,
                                    ctx.conversationId,
                                    ctx.replyJid,
                                    ctx.phone,
                                    messageContent
                                )
                                console.log(`[Webhook] ✅ AI processed message from ${phone}`)
                            } catch (err) {
                                console.error(
                                    `[Webhook] ❌ AI error for ${phone}:`,
                                    err instanceof Error ? err.message : err
                                )
                            }
                        })
                    } else {
                        console.log(`[Webhook] AI disabled for conversation ${ctx.conversationId}`)
                    }
                } catch (err) {
                    persistFailures++
                    console.error(
                        `[Webhook] ❌ Persist failed for ${phone}:`,
                        err instanceof Error ? err.message : err
                    )
                }
            }

            if (persistFailures > 0 && persistedCount === 0) {
                return NextResponse.json({ status: 'persist_failed' }, { status: 500 })
            }
        } else if (eventType === 'messages.update') {
            const data = payload.data as Record<string, unknown> | undefined
            const messageId = (data?.keyId as string) || (data?.key as { id?: string })?.id
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
                const newStatus = statusMap[data?.status as string] || (data?.status as string)

                try {
                    await db
                        .update(messages)
                        .set({ status: newStatus })
                        .where(eq(messages.whatsappMessageId, messageId))
                } catch (err) {
                    console.error('[Webhook] Failed to update message status:', err)
                }
            }
        } else {
            console.warn(`[Webhook] Unhandled event: ${payload.event}`)
        }

        return NextResponse.json({
            status: 'ok',
            persisted: persistedCount,
            ...(skipped.length > 0 ? { skipped } : {}),
        })
    } catch (error) {
        console.error('[Webhook] Major error:', error)
        return NextResponse.json({ status: 'error' }, { status: 500 })
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

interface PersistedInboundContext {
    contactId: string
    conversationId: string
    phone: string
    replyJid: string
    aiEnabled: boolean
}

/** Synchronous: contact, conversation, inbound message — must complete before HTTP 200 */
async function persistInboundMessage(
    phone: string,
    replyJid: string,
    senderName: string,
    messageContent: string,
    messageType: string,
    whatsappMessageId: string
): Promise<PersistedInboundContext> {
    console.log(`[Handler] Persisting ${phone} | MsgId: ${whatsappMessageId}`)

    let [contact] = await db.select().from(contacts).where(eq(contacts.phone, phone)).limit(1)

    if (!contact) {
        console.log(`[Handler] Creating new contact for ${senderName} (${phone})...`)
        const [newContact] = await db
            .insert(contacts)
            .values({
                name: senderName,
                phone,
                whatsappId: replyJid,
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
                whatsappId: replyJid,
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

    await db.insert(messages).values({
        conversationId: conversation.id,
        whatsappMessageId,
        direction: 'inbound',
        sender: 'contact',
        content: messageContent,
        messageType,
        status: 'read',
    })

    return {
        contactId: contact.id,
        conversationId: conversation.id,
        phone,
        replyJid,
        aiEnabled: conversation.aiEnabled,
    }
}

async function runSDRAgent(
    contactId: string,
    conversationId: string,
    replyJid: string,
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

        await sendAndSaveReply(replyJid, result.reply, conversationId, true)
    } catch (aiError) {
        console.error('[AI] ❌ Agent error:', aiError instanceof Error ? aiError.message : aiError)
        await sendFallback(replyJid, conversationId, phone)
    }
}

async function sendFallback(replyJid: string, conversationId: string, phone: string) {
    try {
        console.log(`[AI] Sending fallback message to ${phone}...`)
        await sendAndSaveReply(replyJid, FALLBACK_MESSAGE, conversationId, true)
    } catch (fallbackError) {
        console.error(
            '[AI] ❌ Even fallback message failed:',
            fallbackError instanceof Error ? fallbackError.message : fallbackError
        )
        console.error('[AI] EVOLUTION_API_URL:', process.env.EVOLUTION_API_URL)
    }
}

async function sendAndSaveReply(
    replyJid: string,
    text: string,
    conversationId: string,
    aiGenerated: boolean
) {
    const number = normalizePhone(replyJid)
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
    const location = message.locationMessage as
        | { degreesLatitude?: number; degreesLongitude?: number }
        | undefined
    if (location) {
        return `[Localização: ${location.degreesLatitude}, ${location.degreesLongitude}]`
    }

    return '[Mensagem]'
}
