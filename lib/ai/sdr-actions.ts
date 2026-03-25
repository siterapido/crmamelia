/**
 * SDR Action Executor
 * Processes structured actions from the AI agent response
 * Integrates with CRM pipeline for automatic lead progression
 */

import { db } from '@/lib/db'
import { contacts, conversations, deals, pipelineStages, contactFollowups, contactActivities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Contact } from '@/lib/db/schema'
import type { SDRAction } from './sdr-agent'

// Cache pipeline stages to avoid repeated DB queries
let stagesCache: { id: string; slug: string; name: string; order: number }[] | null = null

async function getStages() {
    if (!stagesCache) {
        stagesCache = await db
            .select({ id: pipelineStages.id, slug: pipelineStages.slug, name: pipelineStages.name, order: pipelineStages.order })
            .from(pipelineStages)
            .orderBy(pipelineStages.order)
    }
    return stagesCache
}

async function getStageBySlug(slug: string) {
    const stages = await getStages()
    return stages.find(s => s.slug === slug)
}

/**
 * Ensure a deal exists for the contact, creating one if needed
 */
export async function ensureDeal(contact: Contact): Promise<string> {
    const [existingDeal] = await db
        .select()
        .from(deals)
        .where(eq(deals.contactId, contact.id))
        .limit(1)

    if (existingDeal) return existingDeal.id

    const stage = await getStageBySlug('new')
    if (!stage) {
        console.error('[CRM] Pipeline stage "new" not found')
        throw new Error('Pipeline stage "new" not found')
    }

    const [newDeal] = await db.insert(deals).values({
        contactId: contact.id,
        stageId: stage.id,
        title: `${contact.name} - SIX Saúde`,
        planInterest: contact.planInterest,
        livesCount: contact.livesCount,
    }).returning()

    console.log(`[CRM] Created deal ${newDeal.id} for contact ${contact.name} in stage "Novo"`)
    return newDeal.id
}

/**
 * Move a deal to a specific pipeline stage by slug
 */
async function moveDealToStage(contactId: string, stageSlug: string) {
    const stage = await getStageBySlug(stageSlug)
    if (!stage) {
        console.error(`[CRM] Pipeline stage "${stageSlug}" not found`)
        return
    }

    const [deal] = await db
        .select()
        .from(deals)
        .where(eq(deals.contactId, contactId))
        .limit(1)

    if (!deal) {
        console.log(`[CRM] No deal found for contact ${contactId}, skipping stage move`)
        return
    }

    const updateData: Record<string, unknown> = {
        stageId: stage.id,
        updatedAt: new Date(),
    }

    if (stageSlug === 'won') updateData.wonAt = new Date()
    if (stageSlug === 'lost') updateData.lostAt = new Date()

    await db
        .update(deals)
        .set(updateData)
        .where(eq(deals.id, deal.id))

    console.log(`[CRM] Moved deal ${deal.id} to stage "${stage.name}"`)
}

/**
 * Mark a deal as lost due to inactivity (called by the inactivity cron)
 * Only moves deals that are not already won/lost
 */
export async function markDealLostByInactivity(contactId: string): Promise<void> {
    const stage = await getStageBySlug('lost')
    if (!stage) {
        console.error('[CRM] Pipeline stage "lost" not found')
        return
    }

    const [deal] = await db
        .select()
        .from(deals)
        .where(eq(deals.contactId, contactId))
        .limit(1)

    if (!deal) return

    // Don't override won deals
    if (deal.wonAt) {
        console.log(`[CRM] Deal ${deal.id} already won, skipping inactivity loss`)
        return
    }

    // Already lost — skip
    if (deal.stageId === stage.id) return

    await db
        .update(deals)
        .set({
            stageId: stage.id,
            lostAt: new Date(),
            lostReason: 'Inatividade — sem resposta após mensagens de recuperação',
            updatedAt: new Date(),
        })
        .where(eq(deals.id, deal.id))

    console.log(`[CRM] Deal ${deal.id} marked as lost by inactivity`)
}

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
                    await handleHandoff(contact, conversationId, action)
                    break
                case 'score_lead':
                    await handleScoreLead(contact, action)
                    break
                case 'schedule_followup':
                    await handleScheduleFollowup(contact, conversationId, action)
                    break
            }
        } catch (error) {
            console.error(`[CRM] Error executing SDR action ${action.type}:`, error)
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
        case 'cpf_cnpj':
            updateData.cpfCnpj = action.value
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

    console.log(`[CRM] Qualified contact ${contact.id}: ${action.field} = ${action.value}`)

    // Also update the deal title if name changed
    if (action.field === 'name') {
        const [deal] = await db.select().from(deals).where(eq(deals.contactId, contact.id)).limit(1)
        if (deal) {
            await db.update(deals).set({ title: `${action.value} - SIX Saúde`, updatedAt: new Date() }).where(eq(deals.id, deal.id))
        }
    }

    // Update deal with livesCount
    if (action.field === 'lives_count') {
        const [deal] = await db.select().from(deals).where(eq(deals.contactId, contact.id)).limit(1)
        if (deal) {
            await db.update(deals).set({ livesCount: parseInt(action.value) || null, updatedAt: new Date() }).where(eq(deals.id, deal.id))
        }
    }

    // After qualifying, check if contact now has all data → auto move to "qualified"
    const [freshContact] = await db.select().from(contacts).where(eq(contacts.id, contact.id)).limit(1)
    if (freshContact) {
        const hasName = freshContact.name && freshContact.name !== 'WhatsApp User'
        const hasAddress = !!freshContact.address
        const hasLives = !!freshContact.livesCount

        if (hasName && hasAddress && hasLives) {
            // All data collected → move to qualified
            await db.update(contacts).set({ status: 'qualified', updatedAt: new Date() }).where(eq(contacts.id, contact.id))
            await moveDealToStage(contact.id, 'qualified')
            console.log(`[CRM] Auto-qualified contact ${contact.id} - all data collected`)
        }
    }
}

async function handleUpdateStage(contact: Contact, action: SDRAction) {
    if (!action.stage) return

    // Update contact status
    await db
        .update(contacts)
        .set({ status: action.stage, updatedAt: new Date() })
        .where(eq(contacts.id, contact.id))

    // Move deal to matching pipeline stage
    await moveDealToStage(contact.id, action.stage)
}

async function handleHandoff(contact: Contact, conversationId: string, action: SDRAction) {
    // Disable AI for this conversation
    await db
        .update(conversations)
        .set({ aiEnabled: false })
        .where(eq(conversations.id, conversationId))

    // Move contact to "proposal" (waiting for human consultant)
    await db
        .update(contacts)
        .set({ status: 'proposal', updatedAt: new Date() })
        .where(eq(contacts.id, contact.id))

    // Move deal to "proposal" stage
    await moveDealToStage(contact.id, 'proposal')

    console.log(`[CRM] Handoff triggered for ${contact.name}: ${action.reason || 'No reason given'} → moved to "Proposta"`)
}

async function handleScoreLead(contact: Contact, action: SDRAction) {
    const score = action.score
    if (!score || score < 1 || score > 5) return

    // Update contact lead score
    await db
        .update(contacts)
        .set({ leadScore: score, updatedAt: new Date() })
        .where(eq(contacts.id, contact.id))

    // Log as activity
    await db.insert(contactActivities).values({
        contactId: contact.id,
        type: 'note',
        title: `Lead Score: ${score}/5`,
        description: action.reason || `Avaliação automática do agente IA: ${score}/5`,
    })

    // Update deal with lead score info in notes
    const [deal] = await db.select().from(deals).where(eq(deals.contactId, contact.id)).limit(1)
    if (deal) {
        const scoreNote = `Lead Score: ${score}/5 - ${action.reason || 'Avaliação IA'}`
        const existingNotes = deal.notes || ''
        const newNotes = existingNotes ? `${scoreNote}\n${existingNotes}` : scoreNote
        await db.update(deals).set({ notes: newNotes, updatedAt: new Date() }).where(eq(deals.id, deal.id))
    }

    console.log(`[CRM] Lead score for ${contact.name}: ${score}/5 — ${action.reason || 'No reason'}`)
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

    console.log(`[CRM] Scheduled follow-up for ${contact.name} in ${action.delay_hours}h`)
}
