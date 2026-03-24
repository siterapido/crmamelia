/**
 * Profile API Route
 * PATCH /api/crm/profile - Update own name or password (any authenticated user)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateProfileSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres').optional(),
})

export async function PATCH(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const result = updateProfileSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const { name, currentPassword, newPassword } = result.data
        const updateData: Record<string, unknown> = { updatedAt: new Date() }

        if (name) {
            updateData.name = name
        }

        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Informe a senha atual para alterar a senha' }, { status: 400 })
            }

            const [userRecord] = await db
                .select({ passwordHash: users.passwordHash })
                .from(users)
                .where(eq(users.id, currentUser.userId))
                .limit(1)

            if (!userRecord) {
                return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
            }

            const valid = await verifyPassword(currentPassword, userRecord.passwordHash)
            if (!valid) {
                return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
            }

            updateData.passwordHash = await hashPassword(newPassword)
        }

        if (Object.keys(updateData).length === 1) {
            return NextResponse.json({ error: 'Nenhum dado para atualizar' }, { status: 400 })
        }

        const [updated] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, currentUser.userId))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
            })

        return NextResponse.json({ success: true, user: updated })
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
    }
}
