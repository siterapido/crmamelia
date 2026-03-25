/**
 * Deals API Route
 * GET /api/crm/deals - List deals (filterable by stage)
 * POST /api/crm/deals - Create deal
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deals, contacts, pipelineStages, users, conversations } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { canViewAllCRMData } from '@/lib/auth/rbac'
import { eq, desc, sql, or, and } from 'drizzle-orm'
import { z } from 'zod'

const createDealSchema = z.object({
    contactId: z.string().uuid(),
    stageId: z.string().uuid(),
    title: z.string().min(1, 'Título é obrigatório'),
    value: z.number().int().optional(),
    planInterest: z.string().optional(),
    livesCount: z.number().int().positive().optional(),
    expectedCloseDate: z.string().datetime().optional(),
    assignedTo: z.string().uuid().optional(),
    notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const stageSlug = searchParams.get('stage')

        const conditions = []

        if (stageSlug && stageSlug !== 'all') {
            const [stage] = await db
                .select({ id: pipelineStages.id })
                .from(pipelineStages)
                .where(eq(pipelineStages.slug, stageSlug))
                .limit(1)
            if (stage) {
                conditions.push(eq(deals.stageId, stage.id))
            }
        }

        const assignedFilter = searchParams.get('assignedTo')
        
        // Vendedores só veem deals atribuídos a eles
        if (!canViewAllCRMData(user)) {
            if (assignedFilter === 'me' || assignedFilter === 'unassigned' || !assignedFilter) {
                conditions.push(
                    or(
                        eq(deals.assignedTo, user.userId),
                        sql`${deals.assignedTo} IS NULL`
                    )
                )
            }
        } else if (assignedFilter === 'me') {
            conditions.push(eq(deals.assignedTo, user.userId))
        } else if (assignedFilter === 'unassigned') {
            conditions.push(sql`${deals.assignedTo} IS NULL`)
        } else if (assignedFilter && assignedFilter !== 'all') {
            conditions.push(eq(deals.assignedTo, assignedFilter))
        }

        const dealsData = await db
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
                    cpfCnpj: contacts.cpfCnpj,
                    profilePictureUrl: contacts.profilePictureUrl,
                    leadScore: contacts.leadScore,
                },
                stage: {
                    id: pipelineStages.id,
                    name: pipelineStages.name,
                    slug: pipelineStages.slug,
                    color: pipelineStages.color,
                    order: pipelineStages.order,
                },
                assignedUser: {
                    id: users.id,
                    name: users.name,
                },
                lastInboundAt: sql<string | null>`(
                    SELECT c.last_inbound_at FROM conversations c
                    WHERE c.contact_id = ${deals.contactId}
                    AND c.status = 'active'
                    ORDER BY c.created_at DESC LIMIT 1
                )`.as('last_inbound_at'),
                flowState: sql<string | null>`(
                    SELECT c.flow_state FROM conversations c
                    WHERE c.contact_id = ${deals.contactId}
                    AND c.status = 'active'
                    ORDER BY c.created_at DESC LIMIT 1
                )`.as('flow_state'),
            })
            .from(deals)
            .leftJoin(contacts, eq(deals.contactId, contacts.id))
            .leftJoin(pipelineStages, eq(deals.stageId, pipelineStages.id))
            .leftJoin(users, eq(deals.assignedTo, users.id))
            .where(conditions.length > 0 ? conditions[0] : undefined)
            .orderBy(desc(deals.createdAt))

        return NextResponse.json({ data: dealsData })
    } catch (error) {
        console.error('Error fetching deals:', error)
        return NextResponse.json({ error: 'Erro ao buscar deals' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const result = createDealSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const data = result.data

        const [newDeal] = await db
            .insert(deals)
            .values({
                ...data,
                expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
            })
            .returning()

        return NextResponse.json({ success: true, deal: newDeal }, { status: 201 })
    } catch (error) {
        console.error('Error creating deal:', error)
        return NextResponse.json({ error: 'Erro ao criar deal' }, { status: 500 })
    }
}
