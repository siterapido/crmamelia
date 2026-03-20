/**
 * Contact Activities API Route
 * GET /api/crm/contacts/[id]/activities
 * POST /api/crm/contacts/[id]/activities - Create activity
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactActivities, users } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const createSchema = z.object({
    type: z.enum(['note', 'call', 'meeting', 'email', 'task', 'status_change']),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await context.params

        const activities = await db
            .select({
                id: contactActivities.id,
                type: contactActivities.type,
                title: contactActivities.title,
                description: contactActivities.description,
                createdAt: contactActivities.createdAt,
                user: {
                    id: users.id,
                    name: users.name,
                },
            })
            .from(contactActivities)
            .leftJoin(users, eq(contactActivities.userId, users.id))
            .where(eq(contactActivities.contactId, id))
            .orderBy(desc(contactActivities.createdAt))

        return NextResponse.json({
            data: activities.map(a => ({
                ...a,
                user: a.user?.id ? a.user : null,
            }))
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

        const { id } = await context.params
        const body = await request.json()
        const result = createSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const [activity] = await db
            .insert(contactActivities)
            .values({
                contactId: id,
                userId: user.userId,
                ...result.data,
            })
            .returning()

        return NextResponse.json({ success: true, activity }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
