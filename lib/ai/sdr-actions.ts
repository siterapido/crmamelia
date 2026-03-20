/**
 * SDR Action Executor
 * Processes structured actions from the AI agent response
 */

import { db } from '@/lib/db'
import { contacts, conversations, deals, pipelineStages, contactFollowups } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Contact } from '@/lib/db/schema'
import type { SDRAction } from './sdr-agent'

export async function executeSDRActions(
    actions: SDRAction[],
    contact: Contact,
    conversationId: string
): Promise<void> {
    for (const action of actions) {
        try {
            switch (action.type) {
                case 'qualify':
                    await handleQualify(contact, action)
                    break
                case 'update_stage':
                    await handleUpdateStage(contact, action)
                    break
                case 'handoff':
                    await handleHandoff(conversationId, action)
                    break
                case 'schedule_followup':
                    await handleScheduleFollowup(contact, conversationId, action)
                    break
            }
        } catch (error) {
            console.error(`Error executing SDR action ${action.type}:`, error)
        }
    }
}

async function handleQualify(contact: Contact, action: SDRAction) {
    if (!action.field || !action.value) return

    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    switch (action.field) {
        case 'name':
            updateData.name = action.value
            break
        case 'lives_count':
            updateData.livesCount = parseInt(action.value) || null
            break
        case 'plan_interest':
            updateData.planInterest = action.value
            break
        case 'company':
            updateData.company = action.value
            break
        case 'address':
            updateData.address = action.value
            break
        default:
            return
    }

    await db
        .update(contacts)
        .set(updateData)
        .where(eq(contacts.id, contact.id))
}

async function handleUpdateStage(contact: Contact, action: SDRAction) {
    if (!action.stage) return

    // Update contact status
    await db
        .update(contacts)
        .set({ status: action.stage, updatedAt: new Date() })
        .where(eq(contacts.id, contact.id))

    // Find the pipeline stage
    const [stage] = await db
        .select()
        .from(pipelineStages)
        .where(eq(pipelineStages.slug, action.stage))
        .limit(1)

    if (!stage) return

    // Create or update deal
    const [existingDeal] = await db
        .select()
        .from(deals)
        .where(eq(deals.contactId, contact.id))
        .limit(1)

    if (existingDeal) {
        await db
            .update(deals)
            .set({ stageId: stage.id, updatedAt: new Date() })
            .where(eq(deals.id, existingDeal.id))
    } else {
        await db.insert(deals).values({
            contactId: contact.id,
            stageId: stage.id,
            title: `${contact.name} - ${contact.planInterest || 'Plano SIX Saúde'}`,
            planInterest: contact.planInterest,
            livesCount: contact.livesCount,
        })
    }
}

async function handleHandoff(conversationId: string, action: SDRAction) {
    // Disable AI for this conversation
    await db
        .update(conversations)
        .set({ aiEnabled: false })
        .where(eq(conversations.id, conversationId))

    console.log(`Handoff triggered: ${action.reason || 'No reason given'}`)
}

async function handleScheduleFollowup(contact: Contact, conversationId: string, action: SDRAction) {
    if (!action.delay_hours || !action.message) return

    const scheduledAt = new Date()
    scheduledAt.setHours(scheduledAt.getHours() + action.delay_hours)

    await db.insert(contactFollowups).values({
        contactId: contact.id,
        conversationId,
        scheduledAt,
        message: action.message,
    })
}
