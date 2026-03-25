/**
 * Inactivity Monitor & Recovery Agent
 * Runs every 30 minutes to detect inactive conversations and send recovery messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { conversations, contacts, messages, contactActivities } from '@/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'
import { sendTextMessage } from '@/lib/whatsapp/evolution-client'
import { RECOVERY_MESSAGES, INACTIVITY_THRESHOLDS, INACTIVITY_ACTIVITY_LOG } from '@/lib/ai/inactivity-messages'
import { markDealLostByInactivity } from '@/lib/ai/sdr-actions'

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret'

export async function POST(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        console.error('[Inactivity Cron] ❌ Unauthorized: Invalid CRON_SECRET')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Inactivity Cron] ⏰ Starting inactivity check...')
    const now = new Date()
    const stats = {
        checked: 0,
        recovery_1_sent: 0,
        recovery_2_sent: 0,
        archived: 0,
        closed: 0,
        errors: 0
    }

    try {
        // 1. Get all active conversations
        const allConversations = await db
            .select({
                id: conversations.id,
                contactId: conversations.contactId,
                aiEnabled: conversations.aiEnabled,
                flowState: conversations.flowState,
                lastInboundAt: conversations.lastInboundAt,
                status: conversations.status,
            })
            .from(conversations)
            .where(
                or(
                    eq(conversations.status, 'active'),
                    and(
                        eq(conversations.status, 'archived'),
                        eq(conversations.flowState, 'dormant')
                    )
                )
            )

        console.log(`[Inactivity Cron] Found ${allConversations.length} active conversations to check`)

        // Process each conversation
        for (const conv of allConversations) {
            stats.checked++

            if (!conv.lastInboundAt) {
                console.log(`[Inactivity Cron] Skipping ${conv.id}: no lastInboundAt tracked yet`)
                continue
            }

            const hoursSinceLastInbound = (now.getTime() - conv.lastInboundAt.getTime()) / (1000 * 60 * 60)

            // Get contact info for phone number
            const [contact] = await db
                .select()
                .from(contacts)
                .where(eq(contacts.id, conv.contactId))
                .limit(1)

            if (!contact) {
                console.error(`[Inactivity Cron] Contact not found for conversation ${conv.id}`)
                stats.errors++
                continue
            }

            console.log(
                `[Inactivity Cron] Conv ${conv.id.slice(0, 8)} | Contact: ${contact.phone} | State: ${conv.flowState} | Hours inactive: ${hoursSinceLastInbound.toFixed(1)}`
            )

            // State machine transitions
            try {
                // Case 1: active → recovery_1 (4h threshold, AI enabled)
                if (
                    conv.flowState === 'active' &&
                    conv.aiEnabled &&
                    hoursSinceLastInbound >= INACTIVITY_THRESHOLDS.recovery_1
                ) {
                    console.log(`[Inactivity Cron] Sending recovery_1 to ${contact.phone}`)

                    try {
                        await sendTextMessage(contact.phone, RECOVERY_MESSAGES.recovery_1)

                        // Save message to DB
                        await db.insert(messages).values({
                            conversationId: conv.id,
                            direction: 'outbound',
                            sender: 'ai',
                            content: RECOVERY_MESSAGES.recovery_1,
                            messageType: 'text',
                            status: 'sent',
                            aiGenerated: true,
                        })

                        // Update conversation state
                        await db
                            .update(conversations)
                            .set({ flowState: 'recovery_1' })
                            .where(eq(conversations.id, conv.id))

                        // Log activity
                        await db.insert(contactActivities).values({
                            contactId: conv.contactId,
                            type: 'status_change',
                            title: INACTIVITY_ACTIVITY_LOG.recovery_1_sent.title,
                            metadata: JSON.stringify({ flowState: 'recovery_1' }),
                        })

                        stats.recovery_1_sent++
                    } catch (err) {
                        console.error(`[Inactivity Cron] Failed to send recovery_1: ${err instanceof Error ? err.message : String(err)}`)
                        stats.errors++
                    }
                }

                // Case 2: recovery_1 → recovery_2 (24h threshold)
                else if (
                    conv.flowState === 'recovery_1' &&
                    hoursSinceLastInbound >= INACTIVITY_THRESHOLDS.recovery_2
                ) {
                    console.log(`[Inactivity Cron] Sending recovery_2 to ${contact.phone}`)

                    try {
                        await sendTextMessage(contact.phone, RECOVERY_MESSAGES.recovery_2)

                        // Save message to DB
                        await db.insert(messages).values({
                            conversationId: conv.id,
                            direction: 'outbound',
                            sender: 'ai',
                            content: RECOVERY_MESSAGES.recovery_2,
                            messageType: 'text',
                            status: 'sent',
                            aiGenerated: true,
                        })

                        // Update conversation state
                        await db
                            .update(conversations)
                            .set({ flowState: 'recovery_2' })
                            .where(eq(conversations.id, conv.id))

                        // Log activity
                        await db.insert(contactActivities).values({
                            contactId: conv.contactId,
                            type: 'status_change',
                            title: INACTIVITY_ACTIVITY_LOG.recovery_2_sent.title,
                            metadata: JSON.stringify({ flowState: 'recovery_2' }),
                        })

                        stats.recovery_2_sent++
                    } catch (err) {
                        console.error(`[Inactivity Cron] Failed to send recovery_2: ${err instanceof Error ? err.message : String(err)}`)
                        stats.errors++
                    }
                }

                // Case 3: recovery_2 → dormant/archived (48h threshold)
                else if (
                    (conv.flowState === 'recovery_2' || conv.flowState === 'active') &&
                    hoursSinceLastInbound >= INACTIVITY_THRESHOLDS.dormant
                ) {
                    console.log(`[Inactivity Cron] Archiving conversation ${conv.id.slice(0, 8)} (${contact.phone})`)

                    try {
                        await db
                            .update(conversations)
                            .set({
                                status: 'archived',
                                flowState: 'dormant',
                                closedAt: now
                            })
                            .where(eq(conversations.id, conv.id))

                        // Move deal to "Perdido" in pipeline
                        await markDealLostByInactivity(conv.contactId)

                        // Log activity
                        await db.insert(contactActivities).values({
                            contactId: conv.contactId,
                            type: 'status_change',
                            title: INACTIVITY_ACTIVITY_LOG.archived_by_inactivity.title,
                            metadata: JSON.stringify({ flowState: 'dormant', archivedAt: now.toISOString() }),
                        })

                        stats.archived++
                    } catch (err) {
                        console.error(`[Inactivity Cron] Failed to archive: ${err instanceof Error ? err.message : String(err)}`)
                        stats.errors++
                    }
                }

                // Case 4: dormant → closed (7 days archived)
                else if (
                    conv.status === 'archived' &&
                    conv.flowState === 'dormant' &&
                    hoursSinceLastInbound >= INACTIVITY_THRESHOLDS.closed
                ) {
                    console.log(`[Inactivity Cron] Closing conversation ${conv.id.slice(0, 8)} (${contact.phone})`)

                    try {
                        await db
                            .update(conversations)
                            .set({ status: 'closed' })
                            .where(eq(conversations.id, conv.id))

                        // Log activity
                        await db.insert(contactActivities).values({
                            contactId: conv.contactId,
                            type: 'status_change',
                            title: INACTIVITY_ACTIVITY_LOG.closed_by_inactivity.title,
                            metadata: JSON.stringify({ closedAt: now.toISOString() }),
                        })

                        stats.closed++
                    } catch (err) {
                        console.error(`[Inactivity Cron] Failed to close: ${err instanceof Error ? err.message : String(err)}`)
                        stats.errors++
                    }
                }

                // Case 5: aiEnabled=false (human support) → archive after 7 days without AI
                else if (
                    !conv.aiEnabled &&
                    conv.status === 'active' &&
                    hoursSinceLastInbound >= INACTIVITY_THRESHOLDS.closed
                ) {
                    console.log(
                        `[Inactivity Cron] Archiving human support conversation ${conv.id.slice(0, 8)} after 7 days`
                    )

                    try {
                        await db
                            .update(conversations)
                            .set({
                                status: 'archived',
                                flowState: 'dormant',
                                closedAt: now
                            })
                            .where(eq(conversations.id, conv.id))

                        // Move deal to "Perdido" in pipeline
                        await markDealLostByInactivity(conv.contactId)

                        // Log activity
                        await db.insert(contactActivities).values({
                            contactId: conv.contactId,
                            type: 'status_change',
                            title: 'Conversa com atendimento humano arquivada por inatividade prolongada',
                            metadata: JSON.stringify({ reason: 'human_support_abandoned' }),
                        })

                        stats.archived++
                    } catch (err) {
                        console.error(`[Inactivity Cron] Failed to archive human support: ${err instanceof Error ? err.message : String(err)}`)
                        stats.errors++
                    }
                }
            } catch (err) {
                console.error(
                    `[Inactivity Cron] ❌ Unexpected error processing ${conv.id.slice(0, 8)}:`,
                    err instanceof Error ? err.message : String(err)
                )
                stats.errors++
            }
        }

        console.log('[Inactivity Cron] ✅ Completed')
        console.log(JSON.stringify(stats, null, 2))

        return NextResponse.json(stats)
    } catch (error) {
        console.error('[Inactivity Cron] ❌ Fatal error:', error instanceof Error ? error.message : String(error))
        return NextResponse.json(
            { error: 'Internal server error', stats },
            { status: 500 }
        )
    }
}

// Allow manual testing via GET
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return POST(request)
}
