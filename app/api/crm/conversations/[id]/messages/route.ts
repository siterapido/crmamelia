/**
 * Conversation Messages API Route
 * GET /api/crm/conversations/[id]/messages - Get messages (paginated)
 * POST /api/crm/conversations/[id]/messages - Send manual message via Z-API
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages, conversations, contacts } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq, asc, gte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { sendTextMessage, sendMediaMessage } from '@/lib/whatsapp/evolution-client'

const sendMessageSchema = z.object({
    content: z.string().min(1, 'Mensagem é obrigatória'),
    messageType: z.enum(['text', 'image', 'video', 'document', 'audio']).optional().default('text'),
    mediaUrl: z.string().url().optional(),
    fileName: z.string().optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id } = await context.params
        const { searchParams } = new URL(request.url)
        const since = searchParams.get('since')
        const limit = parseInt(searchParams.get('limit') || '50')

        const conditions = [eq(messages.conversationId, id)]

        if (since) {
            conditions.push(gte(messages.createdAt, new Date(since)))
        }

        const conversationMessages = await db
            .select()
            .from(messages)
            .where(sql`${messages.conversationId} = ${id}${since ? sql` AND ${messages.createdAt} >= ${new Date(since)}` : sql``}`)
            .orderBy(asc(messages.createdAt))
            .limit(limit)

        return NextResponse.json({ data: conversationMessages })
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 })
    }
}

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id } = await context.params
        const body = await request.json()
        const result = sendMessageSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        // Get conversation and contact
        const [conversation] = await db
            .select({
                id: conversations.id,
                contactId: conversations.contactId,
                contactPhone: contacts.phone,
            })
            .from(conversations)
            .leftJoin(contacts, eq(conversations.contactId, contacts.id))
            .where(eq(conversations.id, id))
            .limit(1)

        if (!conversation) {
            return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
        }

        // Send via WhatsApp
        let whatsappMessageId: string | null = null
        let messageStatus = 'sent'
        const { content, messageType = 'text', mediaUrl, fileName } = result.data

        try {
            if (conversation.contactPhone) {
                let waResponse
                if (messageType !== 'text' && mediaUrl) {
                    waResponse = await sendMediaMessage(
                        conversation.contactPhone,
                        mediaUrl,
                        messageType as 'image' | 'video' | 'document' | 'audio',
                        content,
                        fileName
                    )
                } else {
                    waResponse = await sendTextMessage(conversation.contactPhone, content)
                }
                whatsappMessageId = waResponse.key?.id ?? null
            }
        } catch (waError) {
            console.error('WhatsApp send error:', waError)
            messageStatus = 'failed'
        }

        // Save message
        const [newMessage] = await db
            .insert(messages)
            .values({
                conversationId: id,
                whatsappMessageId,
                direction: 'outbound',
                sender: 'agent',
                content,
                messageType,
                mediaUrl: mediaUrl || null,
                status: messageStatus,
                aiGenerated: false,
            })
            .returning()

        // Update conversation lastMessageAt
        await db
            .update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, id))

        // Update contact lastContactAt
        await db
            .update(contacts)
            .set({ lastContactAt: new Date(), updatedAt: new Date() })
            .where(eq(contacts.id, conversation.contactId))

        return NextResponse.json({ success: true, message: newMessage }, { status: 201 })
    } catch (error) {
        console.error('Error sending message:', error)
        return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
    }
}
