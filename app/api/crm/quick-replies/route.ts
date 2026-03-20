/**
 * Quick Replies API Route
 * GET /api/crm/quick-replies - List all templates
 * POST /api/crm/quick-replies - Create template
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { quickReplies } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { desc } from 'drizzle-orm'
import { z } from 'zod'

const createSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    shortcut: z.string().min(1, 'Atalho é obrigatório').regex(/^\//, 'Atalho deve começar com /'),
    content: z.string().min(1, 'Conteúdo é obrigatório'),
    category: z.string().optional(),
})

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const data = await db
            .select()
            .from(quickReplies)
            .orderBy(desc(quickReplies.createdAt))

        return NextResponse.json({ data })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const result = createSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const [newReply] = await db
            .insert(quickReplies)
            .values({ ...result.data, createdBy: user.userId })
            .returning()

        return NextResponse.json({ success: true, quickReply: newReply }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
