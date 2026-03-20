/**
 * Follow-ups API Route
 * GET /api/crm/followups - List pending follow-ups
 * POST /api/crm/followups - Create follow-up
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactFollowups, contacts } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq, asc, and } from 'drizzle-orm'
import { z } from 'zod'

const createSchema = z.object({
    contactId: z.string().uuid(),
    conversationId: z.string().uuid().optional(),
    scheduledAt: z.string().datetime(),
    message: z.string().min(1, 'Mensagem é obrigatória'),
})

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const contactId = searchParams.get('contactId')

        const conditions = [eq(contactFollowups.sent, false)]
        if (contactId) conditions.push(eq(contactFollowups.contactId, contactId))

        const followups = await db
            .select({
                id: contactFollowups.id,
                scheduledAt: contactFollowups.scheduledAt,
                message: contactFollowups.message,
                sent: contactFollowups.sent,
                createdAt: contactFollowups.createdAt,
                contact: {
                    id: contacts.id,
                    name: contacts.name,
                    phone: contacts.phone,
                },
            })
            .from(contactFollowups)
            .leftJoin(contacts, eq(contactFollowups.contactId, contacts.id))
            .where(and(...conditions))
            .orderBy(asc(contactFollowups.scheduledAt))
            .limit(50)

        return NextResponse.json({ data: followups })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const body = await request.json()
        const result = createSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const [followup] = await db
            .insert(contactFollowups)
            .values({
                contactId: result.data.contactId,
                conversationId: result.data.conversationId || null,
                scheduledAt: new Date(result.data.scheduledAt),
                message: result.data.message,
            })
            .returning()

        return NextResponse.json({ success: true, followup }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
