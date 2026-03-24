/**
 * Single User API Route
 * GET /api/crm/users/[id]
 * PATCH /api/crm/users/[id] - Update (admin only)
 * DELETE /api/crm/users/[id] - Delete (admin only, cannot self-delete)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getCurrentUser, hashPassword } from '@/lib/auth'
import { canManageAgents } from '@/lib/auth/rbac'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['admin', 'gestor', 'produtor', 'vendedor']).optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id } = await context.params

        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                avatarUrl: users.avatarUrl,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1)

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        if (!canManageAgents(currentUser)) {
            return NextResponse.json({ error: 'Apenas administradores e gestores podem editar usuários' }, { status: 403 })
        }

        const { id } = await context.params
        const body = await request.json()
        const result = updateUserSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        // Gestores não podem alterar role para admin/gestor
        if (currentUser.role === 'gestor' && result.data.role && result.data.role !== 'vendedor') {
            return NextResponse.json({ error: 'Gestores só podem criar/edit атendentes' }, { status: 400 })
        }

        const updateData: Record<string, unknown> = { ...result.data, updatedAt: new Date() }

        if (result.data.password) {
            updateData.passwordHash = await hashPassword(result.data.password)
            delete updateData.password
        }

        const [updated] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            })

        if (!updated) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
        }

        return NextResponse.json({ success: true, user: updated })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        if (!canManageAgents(currentUser)) {
            return NextResponse.json({ error: 'Apenas administradores e gestores podem deletar usuários' }, { status: 403 })
        }

        const { id } = await context.params

        if (currentUser.userId === id) {
            return NextResponse.json({ error: 'Você não pode deletar seu próprio usuário' }, { status: 400 })
        }

        const [deleted] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({ id: users.id })

        if (!deleted) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
