/**
 * Users API Route
 * GET /api/crm/users - List all users
 * POST /api/crm/users - Create user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getCurrentUser, hashPassword } from '@/lib/auth'
import { canManageAgents } from '@/lib/auth/rbac'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const createUserSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    role: z.enum(['admin', 'gestor', 'produtor', 'vendedor']).default('vendedor'),
})

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        let allUsers

        if (user.role === 'gestor') {
            allUsers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    role: users.role,
                    avatarUrl: users.avatarUrl,
                    createdAt: users.createdAt,
                })
                .from(users)
                .where(eq(users.role, 'vendedor'))
                .orderBy(desc(users.createdAt))
        } else {
            allUsers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    role: users.role,
                    avatarUrl: users.avatarUrl,
                    createdAt: users.createdAt,
                })
                .from(users)
                .orderBy(desc(users.createdAt))
        }

        const mappedUsers = allUsers.map(u => ({
            ...u,
            role: u.role === 'vendedor' ? 'agent' : u.role,
        }))

        return NextResponse.json({ data: mappedUsers })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        if (!canManageAgents(currentUser)) {
            return NextResponse.json({ error: 'Apenas administradores e gestores podem criar usuários' }, { status: 403 })
        }

        const body = await request.json()
        const result = createUserSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const { name, email, password, role } = result.data

        // Gestores só podem criar atendentes (vendedor)
        if (currentUser.role === 'gestor' && role !== 'vendedor') {
            return NextResponse.json({ error: 'Gestores só podem criar atendentes' }, { status: 400 })
        }

        // Check duplicate email
        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

        if (existing) {
            return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 })
        }

        const passwordHash = await hashPassword(password)

        const [newUser] = await db
            .insert(users)
            .values({ name, email, passwordHash, role })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            })

        return NextResponse.json({ success: true, user: newUser }, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }
}
