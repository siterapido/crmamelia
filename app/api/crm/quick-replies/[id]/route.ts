/**
 * Single Quick Reply API Route
 * PATCH /api/crm/quick-replies/[id] - Update
 * DELETE /api/crm/quick-replies/[id] - Delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { quickReplies } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateSchema = z.object({
    title: z.string().min(1).optional(),
    shortcut: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    category: z.string().optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await context.params
        const body = await request.json()
        const result = updateSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const [updated] = await db
            .update(quickReplies)
            .set({ ...result.data, updatedAt: new Date() })
            .where(eq(quickReplies.id, id))
            .returning()

        if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

        return NextResponse.json({ success: true, quickReply: updated })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await context.params

        await db.delete(quickReplies).where(eq(quickReplies.id, id))

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
