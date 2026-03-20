/**
 * Contact Tags API Route
 * GET /api/crm/contacts/[id]/tags
 * POST /api/crm/contacts/[id]/tags - Add tag
 * DELETE /api/crm/contacts/[id]/tags - Remove tag
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactTags } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await context.params

        const tags = await db
            .select()
            .from(contactTags)
            .where(eq(contactTags.contactId, id))

        return NextResponse.json({ data: tags })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await context.params
        const { tag } = await request.json()

        if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
            return NextResponse.json({ error: 'Tag é obrigatória' }, { status: 400 })
        }

        const [newTag] = await db
            .insert(contactTags)
            .values({ contactId: id, tag: tag.trim().toLowerCase() })
            .onConflictDoNothing()
            .returning()

        return NextResponse.json({ success: true, tag: newTag }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await context.params
        const { tag } = await request.json()

        await db
            .delete(contactTags)
            .where(and(eq(contactTags.contactId, id), eq(contactTags.tag, tag)))

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
