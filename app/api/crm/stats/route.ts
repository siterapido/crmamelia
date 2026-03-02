/**
 * CRM Stats API Route
 * GET /api/crm/stats - Dashboard statistics
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts, conversations, deals, messages, aiInteractions, pipelineStages } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { eq, and, sql, gte } from 'drizzle-orm'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [
            totalContacts,
            newContacts,
            qualifiedContacts,
            activeConversations,
            unreadMessages,
            wonDeals,
            totalDeals,
            aiInteractionsToday,
        ] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(contacts),
            db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.status, 'new')),
            db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.status, 'qualified')),
            db.select({ count: sql<number>`count(*)` }).from(conversations).where(eq(conversations.status, 'active')),
            db.select({ count: sql<number>`count(*)` }).from(messages).where(
                and(eq(messages.direction, 'inbound'), eq(messages.status, 'sent'))
            ),
            db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.status, 'won')),
            db.select({ count: sql<number>`count(*)` }).from(deals),
            db.select({ count: sql<number>`count(*)` }).from(aiInteractions).where(
                gte(aiInteractions.createdAt, today)
            ),
        ])

        // Deals by stage
        const dealsByStage = await db
            .select({
                stageId: pipelineStages.id,
                stageName: pipelineStages.name,
                stageSlug: pipelineStages.slug,
                stageColor: pipelineStages.color,
                stageOrder: pipelineStages.order,
                count: sql<number>`count(${deals.id})`,
            })
            .from(pipelineStages)
            .leftJoin(deals, eq(deals.stageId, pipelineStages.id))
            .groupBy(pipelineStages.id, pipelineStages.name, pipelineStages.slug, pipelineStages.color, pipelineStages.order)
            .orderBy(pipelineStages.order)

        // Contacts by source
        const contactsBySource = await db
            .select({
                source: contacts.source,
                count: sql<number>`count(*)`,
            })
            .from(contacts)
            .groupBy(contacts.source)

        return NextResponse.json({
            totalContacts: Number(totalContacts[0]?.count || 0),
            newContacts: Number(newContacts[0]?.count || 0),
            qualifiedContacts: Number(qualifiedContacts[0]?.count || 0),
            activeConversations: Number(activeConversations[0]?.count || 0),
            unreadMessages: Number(unreadMessages[0]?.count || 0),
            wonDeals: Number(wonDeals[0]?.count || 0),
            totalDeals: Number(totalDeals[0]?.count || 0),
            aiInteractionsToday: Number(aiInteractionsToday[0]?.count || 0),
            dealsByStage: dealsByStage.map(s => ({
                ...s,
                count: Number(s.count),
            })),
            contactsBySource: contactsBySource.map(s => ({
                source: s.source,
                count: Number(s.count),
            })),
        })
    } catch (error) {
        console.error('Error fetching CRM stats:', error)
        return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
    }
}
