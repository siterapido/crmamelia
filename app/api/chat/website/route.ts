/**
 * Website Chat Endpoint
 * Integrates the landing page chat widget with CRM + SDR Agent
 * Each session creates a contact/conversation tracked in the CRM
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts, conversations, messages } from '@/lib/db/schema'
import { eq, and, desc, asc } from 'drizzle-orm'
import { processSDRMessage } from '@/lib/ai/sdr-agent'
import { executeSDRActions, ensureDeal } from '@/lib/ai/sdr-actions'

const HANDOFF_MESSAGE =
    'Você está sendo transferido para um atendente humano. Em breve alguém da nossa equipe entrará em contato. Se preferir, pode falar diretamente pelo WhatsApp. 😊'

const FALLBACK_MESSAGE =
    'Olá! Desculpe a demora. Um atendente humano vai te responder em breve. 🙏'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { message, sessionId, conversationId: providedConversationId } = body

        if (!message || !sessionId) {
            return NextResponse.json({ error: 'Missing message or sessionId' }, { status: 400 })
        }

        const phone = `web:${sessionId}`

        // 1. Find or create contact
        let [contact] = await db
            .select()
            .from(contacts)
            .where(eq(contacts.phone, phone))
            .limit(1)

        if (!contact) {
            const [newContact] = await db
                .insert(contacts)
                .values({
                    name: 'Website Visitor',
                    phone,
                    source: 'website',
                    status: 'new',
                    lastContactAt: new Date(),
                })
                .returning()
            contact = newContact
        } else {
            await db
                .update(contacts)
                .set({ lastContactAt: new Date(), updatedAt: new Date() })
                .where(eq(contacts.id, contact.id))
        }

        // 2. Find or create conversation
        let conversation
        if (providedConversationId) {
            const [found] = await db
                .select()
                .from(conversations)
                .where(eq(conversations.id, providedConversationId))
                .limit(1)
            conversation = found
        }

        if (!conversation) {
            const [found] = await db
                .select()
                .from(conversations)
                .where(and(eq(conversations.contactId, contact.id), eq(conversations.status, 'active')))
                .orderBy(desc(conversations.createdAt))
                .limit(1)
            conversation = found
        }

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

            // Create deal for new conversation
            try {
                await ensureDeal(contact)
            } catch (err) {
                console.error('[WebChat] Failed to create deal:', err)
            }
        } else {
            await db
                .update(conversations)
                .set({ lastMessageAt: new Date() })
                .where(eq(conversations.id, conversation.id))
        }

        const conversationId = conversation.id

        // 3. Handoff check — AI disabled, return human agent message
        if (!conversation.aiEnabled) {
            await db.insert(messages).values({
                conversationId,
                direction: 'inbound',
                sender: 'contact',
                content: message,
                messageType: 'text',
                status: 'read',
            })
            await db
                .update(conversations)
                .set({ lastMessageAt: new Date() })
                .where(eq(conversations.id, conversationId))

            return NextResponse.json({
                reply: HANDOFF_MESSAGE,
                conversationId,
                handoff: true,
            })
        }

        // 4. Save inbound message
        await db.insert(messages).values({
            conversationId,
            direction: 'inbound',
            sender: 'contact',
            content: message,
            messageType: 'text',
            status: 'read',
        })

        await db
            .update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, conversationId))

        // 5. Fetch history (last 20 messages ASC)
        const history = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(asc(messages.createdAt))
            .limit(20)

        // 6. Re-fetch contact for latest data
        const [freshContact] = await db
            .select()
            .from(contacts)
            .where(eq(contacts.id, contact.id))
            .limit(1)

        // 7. Auto-move from "new" to "contacted"
        if ((freshContact || contact).status === 'new') {
            await db
                .update(contacts)
                .set({ status: 'contacted', updatedAt: new Date() })
                .where(eq(contacts.id, contact.id))
        }

        let reply: string
        let isHandoff = false

        try {
            // 8. Process with SDR agent
            const result = await processSDRMessage(
                conversationId,
                message,
                history,
                freshContact || contact
            )

            reply = result.reply || FALLBACK_MESSAGE

            // 9. Execute actions
            if (result.actions.length > 0) {
                await executeSDRActions(result.actions, freshContact || contact, conversationId)
                isHandoff = result.actions.some((a) => a.type === 'handoff')
            }
        } catch (aiError) {
            console.error('[WebChat] SDR agent error:', aiError)
            reply = FALLBACK_MESSAGE
        }

        // 10. Save outbound reply
        await db.insert(messages).values({
            conversationId,
            direction: 'outbound',
            sender: 'ai',
            content: reply,
            messageType: 'text',
            status: 'sent',
            aiGenerated: true,
        })

        await db
            .update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, conversationId))

        return NextResponse.json({ reply, conversationId, handoff: isHandoff })
    } catch (error) {
        console.error('[WebChat] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
