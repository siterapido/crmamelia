/**
 * Bulk Deals API Route
 * PATCH /api/crm/deals/bulk - Bulk update deals (assign, change stage, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deals, contacts, pipelineStages } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

const bulkUpdateSchema = z.object({
    dealIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos um deal'),
    stageId: z.string().uuid().optional().or(z.null()),
    assignedTo: z.string().uuid().optional().or(z.null()),
})

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const result = bulkUpdateSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { dealIds, stageId, assignedTo } = result.data

        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        }

        if (stageId !== undefined) {
            updateData.stageId = stageId
            
            if (stageId) {
                const [stage] = await db
                    .select({ slug: pipelineStages.slug })
                    .from(pipelineStages)
                    .where(eq(pipelineStages.id, stageId))
                    .limit(1)

                if (stage?.slug === 'won') {
                    updateData.wonAt = new Date()
                } else if (stage?.slug === 'lost') {
                    updateData.lostAt = new Date()
                }
            }
        }

        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo
        }

        const updatedDeals = await db
            .update(deals)
            .set(updateData)
            .where(inArray(deals.id, dealIds))
            .returning({
                id: deals.id,
                title: deals.title,
                stageId: deals.stageId,
                assignedTo: deals.assignedTo,
            })

        return NextResponse.json({ 
            success: true, 
            updated: updatedDeals.length,
            deals: updatedDeals 
        })
    } catch (error) {
        console.error('Error bulk updating deals:', error)
        return NextResponse.json({ error: 'Erro ao atualizar deals em massa' }, { status: 500 })
    }
}
