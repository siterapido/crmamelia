/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const result = loginSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { email, password } = result.data

        // Find user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

        if (!user) {
            return NextResponse.json(
                { error: 'Credenciais inválidas' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash)
        if (!isValid) {
            return NextResponse.json(
                { error: 'Credenciais inválidas' },
                { status: 401 }
            )
        }

        // Create JWT token
        const token = await createToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        // Set cookie
        await setAuthCookie(token)

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorStack = error instanceof Error ? error.stack : ''
        console.error('Login error:', errorMessage)
        console.error('Stack:', errorStack)
        return NextResponse.json(
            { error: 'Erro interno do servidor', details: errorMessage },
            { status: 500 }
        )
    }
}
