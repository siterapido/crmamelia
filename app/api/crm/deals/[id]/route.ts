/**
 * Single Deal API Route
 * GET /api/crm/deals/[id] - Get deal detail
 * PATCH /api/crm/deals/[id] - Update deal (move stage, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deals, contacts, pipelineStages, users } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateDealSchema = z.object({
    stageId: z.string().uuid().optional(),
    title: z.string().min(1).optional(),
    value: z.number().int().optional().or(z.null()),
    planInterest: z.string().optional().or(z.null()),
    livesCount: z.number().int().positive().optional().or(z.null()),
    expectedCloseDate: z.string().datetime().optional().or(z.null()),
    assignedTo: z.string().uuid().optional().or(z.null()),
    notes: z.string().optional().or(z.null()),
    lostReason: z.string().optional().or(z.null()),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id } = await context.params

        const [deal] = await db
            .select({
                id: deals.id,
                title: deals.title,
                value: deals.value,
                planInterest: deals.planInterest,
                livesCount: deals.livesCount,
                expectedCloseDate: deals.expectedCloseDate,
                wonAt: deals.wonAt,
                lostAt: deals.lostAt,
                lostReason: deals.lostReason,
                notes: deals.notes,
                createdAt: deals.createdAt,
                updatedAt: deals.updatedAt,
                contact: {
                    id: contacts.id,
                    name: contacts.name,
                    phone: contacts.phone,
                    company: contacts.company,
                    email: contacts.email,
                },
                stage: {
                    id: pipelineStages.id,
                    name: pipelineStages.name,
                    slug: pipelineStages.slug,
                    color: pipelineStages.color,
                },
                assignedUser: {
                    id: users.id,
                    name: users.name,
                },
            })
            .from(deals)
            .leftJoin(contacts, eq(deals.contactId, contacts.id))
            .leftJoin(pipelineStages, eq(deals.stageId, pipelineStages.id))
            .leftJoin(users, eq(deals.assignedTo, users.id))
            .where(eq(deals.id, id))
            .limit(1)

        if (!deal) {
            return NextResponse.json({ error: 'Deal não encontrado' }, { status: 404 })
        }

        return NextResponse.json(deal)
    } catch (error) {
        console.error('Error fetching deal:', error)
        return NextResponse.json({ error: 'Erro ao buscar deal' }, { status: 500 })
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
        const result = updateDealSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const updateData: Record<string, unknown> = {
            ...result.data,
            updatedAt: new Date(),
        }

        if (result.data.expectedCloseDate) {
            updateData.expectedCloseDate = new Date(result.data.expectedCloseDate)
        }

        // Check if moving to won or lost stage
        if (result.data.stageId) {
            const [stage] = await db
                .select({ slug: pipelineStages.slug })
                .from(pipelineStages)
                .where(eq(pipelineStages.id, result.data.stageId))
                .limit(1)

            if (stage?.slug === 'won') {
                updateData.wonAt = new Date()
            } else if (stage?.slug === 'lost') {
                updateData.lostAt = new Date()
            }
        }

        const [updated] = await db
            .update(deals)
            .set(updateData)
            .where(eq(deals.id, id))
            .returning()

        if (!updated) {
            return NextResponse.json({ error: 'Deal não encontrado' }, { status: 404 })
        }

        return NextResponse.json({ success: true, deal: updated })
    } catch (error) {
        console.error('Error updating deal:', error)
        return NextResponse.json({ error: 'Erro ao atualizar deal' }, { status: 500 })
    }
}
