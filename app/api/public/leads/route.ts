/**
 * POST /api/public/leads
 * Server-to-server lead ingest. Requires Authorization: Bearer CRM_INGEST_TOKEN.
 * neon-http does not support interactive transactions; reservation uses request_id UNIQUE.
 */

import { NextRequest, NextResponse } from 'next/server'
import { and, asc, eq, isNull, lt, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactActivities, contacts, deals, leadCaptures, pipelineStages } from '@/lib/db/schema'
import {
    buildDealNotes,
    buildDealTitle,
    extractBearerToken,
    isUniqueViolation,
    parseLeadCapture,
    pickBetterContactFields,
    verifyIngestToken,
    type NormalizedLeadCapture,
} from '@/lib/crm/lead-capture'

export const runtime = 'nodejs'

const STALE_PROCESSING_MS = 15_000
const NO_STORE = { 'Cache-Control': 'no-store' } as const

function json(body: unknown, status: number) {
    return NextResponse.json(body, { status, headers: NO_STORE })
}

function logFailure(requestId: string | null, code?: string) {
    console.error(JSON.stringify({
        level: 'error',
        event: 'public_lead_capture_failed',
        requestId,
        ...(code ? { code } : {}),
    }))
}

export async function POST(request: NextRequest) {
    let requestId: string | null = null

    try {
        const provided = extractBearerToken(request.headers.get('authorization'))
        if (!verifyIngestToken(provided, process.env.CRM_INGEST_TOKEN)) {
            return json({ error: 'Não autorizado' }, 401)
        }

        let body: unknown
        try {
            body = await request.json()
        } catch {
            return json({ error: 'Payload inválido' }, 400)
        }

        const parsed = parseLeadCapture(body)
        if (!parsed.success) {
            return json({ error: parsed.error }, 400)
        }

        requestId = parsed.data.requestId
        const result = await ingestLead(parsed.data)

        return json(
            {
                success: true,
                requestId: result.requestId,
                contactId: result.contactId,
                dealId: result.dealId,
                ...(result.created ? {} : { replayed: true }),
            },
            result.created ? 201 : 200
        )
    } catch (error) {
        const code = error instanceof IngestError
            ? error.code
            : isUniqueViolation(error)
                ? '23505'
                : undefined
        logFailure(requestId, code)
        return json({ error: 'Erro interno do servidor' }, 500)
    }
}

class IngestError extends Error {
    constructor(readonly code: string) {
        super(code)
        this.name = 'IngestError'
    }
}

async function ingestLead(data: NormalizedLeadCapture): Promise<{
    created: boolean
    requestId: string
    contactId: string
    dealId: string
}> {
    const now = new Date()
    const reserved = await reserveCapture(data, now)

    if (reserved.status === 'completed' && reserved.contactId && reserved.dealId) {
        return {
            created: false,
            requestId: data.requestId,
            contactId: reserved.contactId,
            dealId: reserved.dealId,
        }
    }

    const claimed = await claimCapture(data.requestId, now)
    if (!claimed) {
        return replayCompleted(data.requestId)
    }

    const contact = await findOrCreateContact(data, now)

    if (claimed.dealId) {
        await db
            .update(leadCaptures)
            .set({
                contactId: contact.id,
                status: 'completed',
                updatedAt: new Date(),
            })
            .where(eq(leadCaptures.id, claimed.id))

        return {
            created: false,
            requestId: data.requestId,
            contactId: contact.id,
            dealId: claimed.dealId,
        }
    }

    const [stage] = await db
        .select({ id: pipelineStages.id })
        .from(pipelineStages)
        .orderBy(asc(pipelineStages.order))
        .limit(1)

    if (!stage) {
        throw new IngestError('pipeline_stage_missing')
    }

    const notes = buildDealNotes({
        city: data.city,
        livesCount: data.livesCount,
        ages: data.ages,
        source: data.source,
    })

    const [deal] = await db
        .insert(deals)
        .values({
            contactId: contact.id,
            stageId: stage.id,
            title: buildDealTitle(data.name),
            livesCount: data.livesCount,
            planInterest: 'cotacao-site',
            assignedTo: null,
            notes,
        })
        .returning({ id: deals.id })

    const [finalized] = await db
        .update(leadCaptures)
        .set({
            contactId: contact.id,
            dealId: deal.id,
            status: 'completed',
            updatedAt: new Date(),
        })
        .where(and(eq(leadCaptures.id, claimed.id), isNull(leadCaptures.dealId)))
        .returning({
            contactId: leadCaptures.contactId,
            dealId: leadCaptures.dealId,
        })

    if (!finalized?.dealId) {
        return replayCompleted(data.requestId)
    }

    try {
        await db.insert(contactActivities).values({
            contactId: contact.id,
            type: 'note',
            title: 'Cotação pelo site',
            description: notes,
            metadata: JSON.stringify({ requestId: data.requestId, source: 'website' }),
        })
    } catch {
        logFailure(data.requestId, 'activity_insert_failed')
    }

    return {
        created: true,
        requestId: data.requestId,
        contactId: contact.id,
        dealId: finalized.dealId,
    }
}

async function reserveCapture(data: NormalizedLeadCapture, now: Date) {
    try {
        const [inserted] = await db
            .insert(leadCaptures)
            .values({
                requestId: data.requestId,
                city: data.city,
                ages: data.ages,
                consentAt: data.consentAt,
                pageUrl: data.source.pageUrl,
                referrer: data.source.referrer,
                utmSource: data.source.utmSource,
                utmMedium: data.source.utmMedium,
                utmCampaign: data.source.utmCampaign,
                utmContent: data.source.utmContent,
                utmTerm: data.source.utmTerm,
                gclid: data.source.gclid,
                fbclid: data.source.fbclid,
                status: 'pending',
                createdAt: now,
                updatedAt: now,
            })
            .onConflictDoNothing({ target: leadCaptures.requestId })
            .returning()

        if (inserted) return inserted
    } catch (error) {
        if (!isUniqueViolation(error)) throw error
    }

    const [existing] = await db
        .select()
        .from(leadCaptures)
        .where(eq(leadCaptures.requestId, data.requestId))
        .limit(1)

    if (!existing) {
        throw new IngestError('lead_capture_missing_after_conflict')
    }

    return existing
}

async function claimCapture(requestId: string, now: Date) {
    const staleBefore = new Date(now.getTime() - STALE_PROCESSING_MS)

    const [claimed] = await db
        .update(leadCaptures)
        .set({ status: 'processing', updatedAt: now })
        .where(and(
            eq(leadCaptures.requestId, requestId),
            isNull(leadCaptures.dealId),
            or(
                eq(leadCaptures.status, 'pending'),
                and(eq(leadCaptures.status, 'processing'), lt(leadCaptures.updatedAt, staleBefore))
            )
        ))
        .returning()

    return claimed ?? null
}

async function replayCompleted(requestId: string) {
    for (let attempt = 0; attempt < 4; attempt++) {
        const [existing] = await db
            .select({
                contactId: leadCaptures.contactId,
                dealId: leadCaptures.dealId,
            })
            .from(leadCaptures)
            .where(eq(leadCaptures.requestId, requestId))
            .limit(1)

        if (existing?.contactId && existing.dealId) {
            return {
                created: false,
                requestId,
                contactId: existing.contactId,
                dealId: existing.dealId,
            }
        }

        if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)))
        }
    }

    throw new IngestError('lead_capture_in_progress')
}

async function findOrCreateContact(data: NormalizedLeadCapture, now: Date) {
    const [existing] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.phone, data.whatsapp))
        .limit(1)

    let contact = existing

    if (!contact) {
        try {
            const [created] = await db
                .insert(contacts)
                .values({
                    name: data.name,
                    phone: data.whatsapp,
                    email: data.email,
                    source: 'website',
                    status: 'new',
                    livesCount: data.livesCount,
                    planInterest: 'cotacao-site',
                    lastContactAt: now,
                })
                .onConflictDoNothing({ target: contacts.phone })
                .returning()

            contact = created
        } catch (error) {
            if (!isUniqueViolation(error)) throw error
        }

        if (!contact) {
            const [raced] = await db
                .select()
                .from(contacts)
                .where(eq(contacts.phone, data.whatsapp))
                .limit(1)

            if (!raced) {
                throw new IngestError('contact_missing_after_conflict')
            }
            contact = raced
        }
    }

    const better = pickBetterContactFields(contact, {
        name: data.name,
        email: data.email,
        livesCount: data.livesCount,
    })

    const [updated] = await db
        .update(contacts)
        .set({
            name: better.name,
            email: better.email,
            livesCount: better.livesCount,
            planInterest: better.planInterest,
            lastContactAt: now,
            updatedAt: now,
        })
        .where(eq(contacts.id, contact.id))
        .returning()

    return updated ?? contact
}
