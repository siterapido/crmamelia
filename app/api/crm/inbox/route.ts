/**
 * Inbox API Route
 * GET /api/crm/inbox?assigneeId= - Follow-ups, inactive conversations, stale deals
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
    deals,
    contacts,
    conversations,
    pipelineStages,
    users,
    contactFollowups,
} from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { canViewAllCRMData } from '@/lib/auth/rbac'
import { eq, and, or, sql, asc, desc, lt, isNull } from 'drizzle-orm'

const INACTIVITY_INTERVAL = sql`NOW() - INTERVAL '4 hours'`

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const assigneeId = searchParams.get('assigneeId')

        const viewAll = canViewAllCRMData(user)
        let filterAssignee: string | null = null

        if (!viewAll) {
            filterAssignee = user.userId
        } else if (assigneeId && assigneeId !== 'all') {
            filterAssignee = assigneeId
        }

        const followupWhere = and(
            eq(contactFollowups.sent, false),
            lt(contactFollowups.scheduledAt, new Date()),
            ...(filterAssignee ? [eq(contacts.assignedTo, filterAssignee)] : [])
        )

        const conversationWhere = and(
            eq(conversations.status, 'active'),
            sql`${conversations.lastInboundAt} IS NOT NULL`,
            sql`${conversations.lastInboundAt} <= ${INACTIVITY_INTERVAL}`,
            ...(filterAssignee ? [eq(conversations.assignedTo, filterAssignee)] : [])
        )

        const dealWhere = and(
            isNull(deals.wonAt),
            isNull(deals.lostAt),
            sql`(
                SELECT c.last_inbound_at FROM conversations c
                WHERE c.contact_id = ${deals.contactId}
                AND c.status = 'active'
                ORDER BY c.created_at DESC LIMIT 1
            ) IS NOT NULL`,
            sql`(
                SELECT c.last_inbound_at FROM conversations c
                WHERE c.contact_id = ${deals.contactId}
                AND c.status = 'active'
                ORDER BY c.created_at DESC LIMIT 1
            ) <= ${INACTIVITY_INTERVAL}`,
            ...(filterAssignee ? [eq(deals.assignedTo, filterAssignee)] : [])
        )

        const [followupsData, conversationsData, dealsData, assignees] = await Promise.all([
            db
                .select({
                    id: contactFollowups.id,
                    scheduledAt: contactFollowups.scheduledAt,
                    message: contactFollowups.message,
                    contact: {
                        id: contacts.id,
                        name: contacts.name,
                        phone: contacts.phone,
                    },
                    assignedUser: {
                        id: users.id,
                        name: users.name,
                    },
                })
                .from(contactFollowups)
                .leftJoin(contacts, eq(contactFollowups.contactId, contacts.id))
                .leftJoin(users, eq(contacts.assignedTo, users.id))
                .where(followupWhere)
                .orderBy(asc(contactFollowups.scheduledAt))
                .limit(50),

            db
                .select({
                    id: conversations.id,
                    lastInboundAt: conversations.lastInboundAt,
                    lastMessageAt: conversations.lastMessageAt,
                    contact: {
                        id: contacts.id,
                        name: contacts.name,
                        phone: contacts.phone,
                    },
                    assignedUser: {
                        id: users.id,
                        name: users.name,
                    },
                })
                .from(conversations)
                .leftJoin(contacts, eq(conversations.contactId, contacts.id))
                .leftJoin(users, eq(conversations.assignedTo, users.id))
                .where(conversationWhere)
                .orderBy(desc(conversations.lastInboundAt))
                .limit(50),

            db
                .select({
                    id: deals.id,
                    title: deals.title,
                    contact: {
                        id: contacts.id,
                        name: contacts.name,
                        phone: contacts.phone,
                    },
                    stage: {
                        id: pipelineStages.id,
                        name: pipelineStages.name,
                        slug: pipelineStages.slug,
                        color: pipelineStages.color,
                    },
                    assignedUser: {
                        id: users.id,
                        name: users.name,
                    },
                    lastInboundAt: sql<string | null>`(
                        SELECT c.last_inbound_at FROM conversations c
                        WHERE c.contact_id = ${deals.contactId}
                        AND c.status = 'active'
                        ORDER BY c.created_at DESC LIMIT 1
                    )`.as('last_inbound_at'),
                })
                .from(deals)
                .leftJoin(contacts, eq(deals.contactId, contacts.id))
                .leftJoin(pipelineStages, eq(deals.stageId, pipelineStages.id))
                .leftJoin(users, eq(deals.assignedTo, users.id))
                .where(dealWhere)
                .orderBy(desc(deals.updatedAt))
                .limit(50),

            viewAll
                ? db
                      .select({ id: users.id, name: users.name, role: users.role })
                      .from(users)
                      .where(or(eq(users.role, 'vendedor'), eq(users.role, 'gestor'), eq(users.role, 'admin')))
                      .orderBy(users.name)
                : Promise.resolve([]),
        ])

        return NextResponse.json({
            followups: followupsData,
            conversations: conversationsData,
            deals: dealsData,
            assignees: viewAll ? assignees : undefined,
        })
    } catch (error) {
        console.error('Error fetching inbox:', error)
        return NextResponse.json({ error: 'Erro ao buscar inbox' }, { status: 500 })
    }
}
