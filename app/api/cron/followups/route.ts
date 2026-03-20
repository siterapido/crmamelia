/**
 * Cron Job: Process Scheduled Follow-ups
 * Runs hourly via Vercel Cron
 * Sends due follow-up messages via Z-API WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactFollowups, contacts, conversations, messages } from '@/lib/db/schema'
import { eq, and, lte } from 'drizzle-orm'
import { sendTextMessage } from '@/lib/whatsapp/evolution-client'

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const now = new Date()

        // Get due follow-ups
        const dueFollowups = await db
            .select({
                followup: contactFollowups,
                contact: contacts,
            })
            .from(contactFollowups)
            .leftJoin(contacts, eq(contactFollowups.contactId, contacts.id))
            .where(
                and(
                    eq(contactFollowups.sent, false),
                    lte(contactFollowups.scheduledAt, now)
                )
            )
            .limit(50)

        let sent = 0
        let failed = 0

        for (const { followup, contact } of dueFollowups) {
            if (!contact?.phone) {
                failed++
                continue
            }

            try {
                // Send message via WhatsApp
                const waResponse = await sendTextMessage(contact.phone, followup.message)

                // Save as outbound message if conversation exists
                if (followup.conversationId) {
                    await db.insert(messages).values({
                        conversationId: followup.conversationId,
                        whatsappMessageId: waResponse.key?.id ?? null,
                        direction: 'outbound',
                        sender: 'ai',
                        content: followup.message,
                        messageType: 'text',
                        status: 'sent',
                        aiGenerated: true,
                    })

                    // Update conversation timestamp
                    await db
                        .update(conversations)
                        .set({ lastMessageAt: now })
                        .where(eq(conversations.id, followup.conversationId))
                }

                // Mark as sent
                await db
                    .update(contactFollowups)
                    .set({ sent: true, sentAt: now })
                    .where(eq(contactFollowups.id, followup.id))

                // Update contact last contact
                await db
                    .update(contacts)
                    .set({ lastContactAt: now, updatedAt: now })
                    .where(eq(contacts.id, contact.id))

                sent++
            } catch (error) {
                console.error(`Failed to send follow-up ${followup.id}:`, error)
                failed++
            }
        }

        return NextResponse.json({
            processed: dueFollowups.length,
            sent,
            failed,
        })
    } catch (error) {
        console.error('Cron follow-ups error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
