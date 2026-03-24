/**
 * Conversations API Route
 * GET /api/crm/conversations - List conversations
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { conversations, contacts, messages, users } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { canViewAllCRMData } from '@/lib/auth/rbac'
import { eq, desc, and, sql, or } from 'drizzle-orm'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '30')
        const status = searchParams.get('status')
        const aiFilter = searchParams.get('ai')
        const assignedFilter = searchParams.get('assignedTo')
        const offset = (page - 1) * limit

        const conditions = []

        if (status && status !== 'all') {
            conditions.push(eq(conversations.status, status))
        }

        if (aiFilter === 'active') {
            conditions.push(eq(conversations.aiEnabled, true))
        } else if (aiFilter === 'human') {
            conditions.push(and(eq(conversations.aiEnabled, false), eq(conversations.status, 'active')))
        }

        // Vendedores só veem conversas atribuídas a eles (ou não atribuídas)
        if (!canViewAllCRMData(user)) {
            if (assignedFilter === 'unassigned') {
                conditions.push(sql`${conversations.assignedTo} IS NULL`)
            } else if (assignedFilter && assignedFilter !== 'all') {
                conditions.push(eq(conversations.assignedTo, assignedFilter))
            } else {
                // Por padrão, vendedor vê suas conversas + não atribuídas
                conditions.push(
                    or(
                        eq(conversations.assignedTo, user.userId),
                        sql`${conversations.assignedTo} IS NULL`
                    )
                )
            }
        } else if (assignedFilter === 'me') {
            conditions.push(eq(conversations.assignedTo, user.userId))
        } else if (assignedFilter === 'unassigned') {
            conditions.push(sql`${conversations.assignedTo} IS NULL`)
        } else if (assignedFilter && assignedFilter !== 'all') {
            conditions.push(eq(conversations.assignedTo, assignedFilter))
        }

        const contactFilter = searchParams.get('contact')
        if (contactFilter) {
            conditions.push(eq(conversations.contactId, contactFilter))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const [conversationsData, countResult] = await Promise.all([
            db
                .select({
                    id: conversations.id,
                    status: conversations.status,
                    aiEnabled: conversations.aiEnabled,
                    assignedTo: conversations.assignedTo,
                    lastMessageAt: conversations.lastMessageAt,
                    createdAt: conversations.createdAt,
                    contact: {
                        id: contacts.id,
                        name: contacts.name,
                        phone: contacts.phone,
                        company: contacts.company,
                        status: contacts.status,
                        profilePictureUrl: contacts.profilePictureUrl,
                    },
                    assignedUser: {
                        id: users.id,
                        name: users.name,
                    },
                    unreadCount: sql<number>`(
                        SELECT count(*) FROM messages
                        WHERE conversation_id = ${conversations.id}
                        AND direction = 'inbound'
                        AND status = 'sent'
                    )`,
                    lastMessage: sql<string>`(
                        SELECT content FROM messages
                        WHERE conversation_id = ${conversations.id}
                        ORDER BY created_at DESC LIMIT 1
                    )`,
                })
                .from(conversations)
                .leftJoin(contacts, eq(conversations.contactId, contacts.id))
                .leftJoin(users, eq(conversations.assignedTo, users.id))
                .where(whereClause)
                .orderBy(desc(conversations.lastMessageAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: sql<number>`count(*)` })
                .from(conversations)
                .where(whereClause),
        ])

        const total = Number(countResult[0]?.count || 0)

        return NextResponse.json({
            data: conversationsData.map(c => ({
                ...c,
                unreadCount: Number(c.unreadCount),
                assignedUser: c.assignedUser?.id ? c.assignedUser : null,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('Error fetching conversations:', error)
        return NextResponse.json({ error: 'Erro ao buscar conversas' }, { status: 500 })
    }
}
