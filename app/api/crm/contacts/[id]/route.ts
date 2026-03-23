/**
 * Single Contact API Route
 * GET /api/crm/contacts/[id] - Get contact with conversations and deals
 * PATCH /api/crm/contacts/[id] - Update contact
 * DELETE /api/crm/contacts/[id] - Delete contact
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts, conversations, deals, pipelineStages, messages, users } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq, desc, sql } from 'drizzle-orm'
import { z } from 'zod'

const updateContactSchema = z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional().or(z.literal('')).or(z.null()),
    company: z.string().optional().or(z.null()),
    cpfCnpj: z.string().optional().or(z.null()),
    source: z.enum(['whatsapp', 'website', 'manual']).optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
    assignedTo: z.string().uuid().optional().or(z.null()),
    notes: z.string().optional().or(z.null()),
    planInterest: z.string().optional().or(z.null()),
    livesCount: z.number().int().positive().optional().or(z.null()),
    leadScore: z.number().int().min(1).max(5).optional().or(z.null()),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id } = await context.params

        const [contact] = await db
            .select({
                id: contacts.id,
                name: contacts.name,
                phone: contacts.phone,
                email: contacts.email,
                company: contacts.company,
                cpfCnpj: contacts.cpfCnpj,
                source: contacts.source,
                status: contacts.status,
                notes: contacts.notes,
                whatsappId: contacts.whatsappId,
                planInterest: contacts.planInterest,
                livesCount: contacts.livesCount,
                leadScore: contacts.leadScore,
                lastContactAt: contacts.lastContactAt,
                createdAt: contacts.createdAt,
                updatedAt: contacts.updatedAt,
                assignedUser: {
                    id: users.id,
                    name: users.name,
                },
            })
            .from(contacts)
            .leftJoin(users, eq(contacts.assignedTo, users.id))
            .where(eq(contacts.id, id))
            .limit(1)

        if (!contact) {
            return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
        }

        // Get conversations
        const contactConversations = await db
            .select({
                id: conversations.id,
                status: conversations.status,
                aiEnabled: conversations.aiEnabled,
                lastMessageAt: conversations.lastMessageAt,
                createdAt: conversations.createdAt,
                messageCount: sql<number>`(SELECT count(*) FROM messages WHERE conversation_id = ${conversations.id})`,
            })
            .from(conversations)
            .where(eq(conversations.contactId, id))
            .orderBy(desc(conversations.lastMessageAt))

        // Get deals
        const contactDeals = await db
            .select({
                id: deals.id,
                title: deals.title,
                value: deals.value,
                planInterest: deals.planInterest,
                livesCount: deals.livesCount,
                createdAt: deals.createdAt,
                stage: {
                    id: pipelineStages.id,
                    name: pipelineStages.name,
                    slug: pipelineStages.slug,
                    color: pipelineStages.color,
                },
            })
            .from(deals)
            .leftJoin(pipelineStages, eq(deals.stageId, pipelineStages.id))
            .where(eq(deals.contactId, id))
            .orderBy(desc(deals.createdAt))

        return NextResponse.json({
            ...contact,
            conversations: contactConversations,
            deals: contactDeals,
        })
    } catch (error) {
        console.error('Error fetching contact:', error)
        return NextResponse.json({ error: 'Erro ao buscar contato' }, { status: 500 })
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
        const result = updateContactSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const [existing] = await db
            .select({ id: contacts.id })
            .from(contacts)
            .where(eq(contacts.id, id))
            .limit(1)

        if (!existing) {
            return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
        }

        const [updatedContact] = await db
            .update(contacts)
            .set({ ...result.data, updatedAt: new Date() })
            .where(eq(contacts.id, id))
            .returning()

        return NextResponse.json({ success: true, contact: updatedContact })
    } catch (error) {
        console.error('Error updating contact:', error)
        return NextResponse.json({ error: 'Erro ao atualizar contato' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id } = await context.params

        const [existing] = await db
            .select({ id: contacts.id })
            .from(contacts)
            .where(eq(contacts.id, id))
            .limit(1)

        if (!existing) {
            return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
        }

        await db.delete(contacts).where(eq(contacts.id, id))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting contact:', error)
        return NextResponse.json({ error: 'Erro ao excluir contato' }, { status: 500 })
    }
}
