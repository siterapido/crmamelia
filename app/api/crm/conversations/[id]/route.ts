/**
 * Single Conversation API Route
 * GET /api/crm/conversations/[id] - Get conversation with messages
 * PATCH /api/crm/conversations/[id] - Update conversation (toggle AI, close)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { conversations, contacts, messages, users } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq, asc } from 'drizzle-orm'
import { z } from 'zod'

const updateConversationSchema = z.object({
    aiEnabled: z.boolean().optional(),
    status: z.enum(['active', 'closed', 'archived']).optional(),
    assignedTo: z.string().uuid().nullable().optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id } = await context.params

        const [conversation] = await db
            .select({
                id: conversations.id,
                status: conversations.status,
                aiEnabled: conversations.aiEnabled,
                assignedTo: conversations.assignedTo,
                lastMessageAt: conversations.lastMessageAt,
                closedAt: conversations.closedAt,
                createdAt: conversations.createdAt,
                contact: {
                    id: contacts.id,
                    name: contacts.name,
                    phone: contacts.phone,
                    email: contacts.email,
                    company: contacts.company,
                    status: contacts.status,
                    planInterest: contacts.planInterest,
                    leadScore: contacts.leadScore,
                    profilePictureUrl: contacts.profilePictureUrl,
                },
                assignedUser: {
                    id: users.id,
                    name: users.name,
                },
            })
            .from(conversations)
            .leftJoin(contacts, eq(conversations.contactId, contacts.id))
            .leftJoin(users, eq(conversations.assignedTo, users.id))
            .where(eq(conversations.id, id))
            .limit(1)

        if (!conversation) {
            return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
        }

        const conversationMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, id))
            .orderBy(asc(messages.createdAt))

        return NextResponse.json({
            ...conversation,
            assignedUser: conversation.assignedUser?.id ? conversation.assignedUser : null,
            messages: conversationMessages,
        })
    } catch (error) {
        console.error('Error fetching conversation:', error)
        return NextResponse.json({ error: 'Erro ao buscar conversa' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id } = await context.params
        const body = await request.json()
        const result = updateConversationSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const updateData: Record<string, unknown> = { ...result.data }

        if (result.data.status === 'closed') {
            updateData.closedAt = new Date()
        }

        const [updated] = await db
            .update(conversations)
            .set(updateData)
            .where(eq(conversations.id, id))
            .returning()

        if (!updated) {
            return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
        }

        return NextResponse.json({ success: true, conversation: updated })
    } catch (error) {
        console.error('Error updating conversation:', error)
        return NextResponse.json({ error: 'Erro ao atualizar conversa' }, { status: 500 })
    }
}
