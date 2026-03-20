/**
 * Single Follow-up API Route
 * PATCH /api/crm/followups/[id] - Mark as sent / update
 * DELETE /api/crm/followups/[id] - Delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactFollowups } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq } from 'drizzle-orm'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await context.params
        const body = await request.json()

        const updateData: Record<string, unknown> = {}
        if (body.sent === true) {
            updateData.sent = true
            updateData.sentAt = new Date()
        }
        if (body.message) updateData.message = body.message
        if (body.scheduledAt) updateData.scheduledAt = new Date(body.scheduledAt)

        const [updated] = await db
            .update(contactFollowups)
            .set(updateData)
            .where(eq(contactFollowups.id, id))
            .returning()

        if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

        return NextResponse.json({ success: true, followup: updated })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await context.params

        await db.delete(contactFollowups).where(eq(contactFollowups.id, id))

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
