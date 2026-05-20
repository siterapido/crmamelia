/**
 * SDR Agent Full Test Endpoint
 * Simulates complete webhook message processing including sending reply.
 * Requires Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts, conversations, messages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { processSDRMessage } from '@/lib/ai/sdr-agent'
import { executeSDRActions, ensureDeal } from '@/lib/ai/sdr-actions'
import { sendTextMessage } from '@/lib/whatsapp/evolution-client'
import { normalizePhone } from '@/lib/whatsapp/client'

export const maxDuration = 60

function isAuthorized(request: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) return false
    const authHeader = request.headers.get('authorization')
    return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const phoneParam = request.nextUrl.searchParams.get('phone')
    const phone = phoneParam ? normalizePhone(phoneParam) : '5521971743873'
    const senderName = 'Test User'

    try {
        console.log(`[TEST] Starting full test for phone ${phone}`)

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
                    source: 'test',
                    status: 'new',
                })
                .returning()
            contact = newContact

            try {
                await ensureDeal(contact)
            } catch (e) {
                console.error(`[TEST] Failed to create deal:`, e)
            }
        }

        let [conversation] = await db
            .select()
            .from(conversations)
            .where(and(eq(conversations.contactId, contact.id), eq(conversations.status, 'active')))
            .limit(1)

        if (!conversation) {
            const [newConv] = await db
                .insert(conversations)
                .values({
                    contactId: contact.id,
                    status: 'active',
                    aiEnabled: true,
                })
                .returning()
            conversation = newConv
        }

        const testMessage = 'Olá, quero informações sobre planos de saúde'
        await db.insert(messages).values({
            conversationId: conversation.id,
            direction: 'inbound',
            sender: 'contact',
            content: testMessage,
            messageType: 'text',
            status: 'read',
        })

        const history = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversation.id))
            .orderBy(messages.createdAt)
            .limit(20)

        const result = await processSDRMessage(conversation.id, testMessage, history, contact)

        if (result.actions.length > 0) {
            await executeSDRActions(result.actions, contact, conversation.id)
        }

        let sendResult: unknown = null
        if (result.reply) {
            sendResult = await sendTextMessage(phone, result.reply)

            await db.insert(messages).values({
                conversationId: conversation.id,
                whatsappMessageId: (sendResult as { key?: { id?: string } })?.key?.id || `test-${Date.now()}`,
                direction: 'outbound',
                sender: 'ai',
                content: result.reply,
                messageType: 'text',
                status: 'sent',
                aiGenerated: true,
            })
        }

        return NextResponse.json({
            success: true,
            contact: contact.id,
            conversation: conversation.id,
            message: testMessage,
            reply: result.reply,
            actions: result.actions,
            sendResult,
        })
    } catch (error) {
        console.error(`[TEST] Error:`, error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        )
    }
}
