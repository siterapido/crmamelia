/**
 * Contacts API Route
 * GET /api/crm/contacts - List contacts
 * POST /api/crm/contacts - Create contact (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts, users } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { canViewAllCRMData } from '@/lib/auth/rbac'
import { eq, desc, ilike, or, and, sql } from 'drizzle-orm'
import { z } from 'zod'

const createContactSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    phone: z.string().min(10, 'Telefone inválido'),
    email: z.string().email().optional().or(z.literal('')),
    company: z.string().optional(),
    cpfCnpj: z.string().optional(),
    source: z.enum(['whatsapp', 'website', 'manual']).optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
    assignedTo: z.string().uuid().optional(),
    notes: z.string().optional(),
    planInterest: z.string().optional(),
    livesCount: z.number().int().positive().optional(),
})

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search')
        const status = searchParams.get('status')
        const source = searchParams.get('source')
        const offset = (page - 1) * limit

        const conditions = []

        if (search) {
            conditions.push(
                or(
                    ilike(contacts.name, `%${search}%`),
                    ilike(contacts.phone, `%${search}%`),
                    ilike(contacts.email, `%${search}%`),
                    ilike(contacts.company, `%${search}%`)
                )
            )
        }

        if (status && status !== 'all') {
            conditions.push(eq(contacts.status, status))
        }

        if (source && source !== 'all') {
            conditions.push(eq(contacts.source, source))
        }

        // Vendedores só veem leads atribuídos a eles
        const assignedFilter = searchParams.get('assignedTo')
        if (!canViewAllCRMData(user)) {
            // Vendedores: apenas seus leads ou não atribuídos (se filtro específico)
            if (assignedFilter === 'me' || assignedFilter === 'unassigned' || !assignedFilter) {
                conditions.push(
                    or(
                        eq(contacts.assignedTo, user.userId),
                        sql`${contacts.assignedTo} IS NULL`
                    )
                )
            }
        } else if (assignedFilter === 'me') {
            conditions.push(eq(contacts.assignedTo, user.userId))
        } else if (assignedFilter === 'unassigned') {
            conditions.push(sql`${contacts.assignedTo} IS NULL`)
        } else if (assignedFilter && assignedFilter !== 'all') {
            conditions.push(eq(contacts.assignedTo, assignedFilter))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const [contactsData, countResult] = await Promise.all([
            db
                .select({
                    id: contacts.id,
                    name: contacts.name,
                    phone: contacts.phone,
                    email: contacts.email,
                    company: contacts.company,
                    source: contacts.source,
                    status: contacts.status,
                    planInterest: contacts.planInterest,
                    livesCount: contacts.livesCount,
                    leadScore: contacts.leadScore,
                    lastContactAt: contacts.lastContactAt,
                    createdAt: contacts.createdAt,
                    assignedUser: {
                        id: users.id,
                        name: users.name,
                    },
                })
                .from(contacts)
                .leftJoin(users, eq(contacts.assignedTo, users.id))
                .where(whereClause)
                .orderBy(desc(contacts.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: sql<number>`count(*)` })
                .from(contacts)
                .where(whereClause),
        ])

        const total = Number(countResult[0]?.count || 0)
        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({
            data: contactsData,
            total,
            page,
            totalPages,
            hasMore: page < totalPages,
        })
    } catch (error) {
        console.error('Error fetching contacts:', error)
        return NextResponse.json({ error: 'Erro ao buscar contatos' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const result = createContactSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const data = result.data

        // Check if phone already exists
        const [existing] = await db
            .select({ id: contacts.id })
            .from(contacts)
            .where(eq(contacts.phone, data.phone))
            .limit(1)

        if (existing) {
            return NextResponse.json(
                { error: 'Contato com este telefone já existe' },
                { status: 400 }
            )
        }

        const [newContact] = await db
            .insert(contacts)
            .values({
                ...data,
                email: data.email || null,
                source: data.source || 'manual',
            })
            .returning()

        return NextResponse.json({ success: true, contact: newContact }, { status: 201 })
    } catch (error) {
        console.error('Error creating contact:', error)
        return NextResponse.json({ error: 'Erro ao criar contato' }, { status: 500 })
    }
}
