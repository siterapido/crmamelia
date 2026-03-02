/**
 * Pipeline Stages API Route
 * GET /api/crm/pipeline/stages - List all pipeline stages (ordered)
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pipelineStages } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { asc } from 'drizzle-orm'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const stages = await db
            .select()
            .from(pipelineStages)
            .orderBy(asc(pipelineStages.order))

        return NextResponse.json({ data: stages })
    } catch (error) {
        console.error('Error fetching pipeline stages:', error)
        return NextResponse.json({ error: 'Erro ao buscar estágios' }, { status: 500 })
    }
}
