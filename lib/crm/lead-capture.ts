import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

export const ATTRIBUTION_LIMITS = {
    pageUrl: 2048,
    referrer: 2048,
    utm: 200,
    clickId: 255,
} as const

const BRAZIL_DDDS = new Set([
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 24, 27, 28,
    31, 32, 33, 34, 35, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48, 49,
    51, 53, 54, 55,
    61, 62, 63, 64, 65, 66, 67, 68, 69,
    71, 73, 74, 75, 77, 79,
    81, 82, 83, 84, 85, 86, 87, 88, 89,
    91, 92, 93, 94, 95, 96, 97, 98, 99,
])

const optionalAttr = z.string().max(512).optional()

export const leadCaptureSourceSchema = z.object({
    pageUrl: z.string().url().max(ATTRIBUTION_LIMITS.pageUrl),
    referrer: z.union([z.string().url().max(ATTRIBUTION_LIMITS.referrer), z.literal('')]).optional(),
    utmSource: optionalAttr,
    utmMedium: optionalAttr,
    utmCampaign: optionalAttr,
    utmContent: optionalAttr,
    utmTerm: optionalAttr,
    gclid: z.string().max(512).optional(),
    fbclid: z.string().max(512).optional(),
})

export const leadCaptureRequestSchema = z
    .object({
        requestId: z.string().uuid(),
        name: z.string().trim().min(2).max(120),
        city: z.string().trim().min(2).max(120),
        email: z.string().email().max(255),
        whatsapp: z.string().min(1).max(40),
        livesCount: z.number().int().min(1).max(99),
        ages: z.array(z.number().int().min(0).max(120)).min(1).max(99),
        consent: z.literal(true),
        consentAt: z.string().datetime(),
        source: leadCaptureSourceSchema,
    })
    .superRefine((data, ctx) => {
        if (data.ages.length !== data.livesCount) {
            ctx.addIssue({
                code: 'custom',
                message: 'ages deve ter exatamente livesCount itens',
                path: ['ages'],
            })
        }
    })

export type LeadCaptureRequest = z.infer<typeof leadCaptureRequestSchema>

export type SanitizedAttribution = {
    pageUrl: string
    referrer: string | null
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    utmContent: string | null
    utmTerm: string | null
    gclid: string | null
    fbclid: string | null
}

export type NormalizedLeadCapture = {
    requestId: string
    name: string
    city: string
    email: string
    whatsapp: string
    livesCount: number
    ages: number[]
    consent: true
    consentAt: Date
    source: SanitizedAttribution
}

export type ParseLeadCaptureResult =
    | { success: true; data: NormalizedLeadCapture }
    | { success: false; error: string }

function stripControlChars(value: string): string {
    return value.replace(/[\u0000-\u001F\u007F]/g, '')
}

function sanitizeBounded(value: string | undefined, max: number): string | null {
    if (value == null) return null
    const cleaned = stripControlChars(value).trim()
    if (!cleaned) return null
    return cleaned.slice(0, max)
}

/**
 * Digits-only Brazilian E.164-ish (55 + DDD + subscriber).
 * Never invents a DDD when the input is subscriber-only.
 */
export function normalizeWhatsApp(input: string): string | null {
    if (typeof input !== 'string') return null

    let digits = input.replace(/\D/g, '')
    if (!digits) return null

    // +55 0XX ... trunk prefix after country code
    if (digits.startsWith('550') && (digits.length === 13 || digits.length === 14)) {
        digits = `55${digits.slice(3)}`
    }

    // National trunk prefix 0 + DDD + subscriber
    if (digits.startsWith('0') && (digits.length === 11 || digits.length === 12)) {
        digits = digits.slice(1)
    }

    // National number with DDD (landline 10 / mobile 11). Do not pad 8–9 digit locals.
    if (digits.length === 10 || digits.length === 11) {
        digits = `55${digits}`
    }

    if (!digits.startsWith('55')) return null
    if (digits.length !== 12 && digits.length !== 13) return null

    const ddd = Number(digits.slice(2, 4))
    if (!BRAZIL_DDDS.has(ddd)) return null

    const subscriber = digits.slice(4)
    if (subscriber.length === 9 && !subscriber.startsWith('9')) return null

    return digits
}

export function sanitizeAttribution(source: {
    pageUrl: string
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmContent?: string
    utmTerm?: string
    gclid?: string
    fbclid?: string
}): SanitizedAttribution {
    return {
        pageUrl: sanitizeBounded(source.pageUrl, ATTRIBUTION_LIMITS.pageUrl) ?? source.pageUrl.slice(0, ATTRIBUTION_LIMITS.pageUrl),
        referrer: source.referrer === '' ? null : sanitizeBounded(source.referrer, ATTRIBUTION_LIMITS.referrer),
        utmSource: sanitizeBounded(source.utmSource, ATTRIBUTION_LIMITS.utm),
        utmMedium: sanitizeBounded(source.utmMedium, ATTRIBUTION_LIMITS.utm),
        utmCampaign: sanitizeBounded(source.utmCampaign, ATTRIBUTION_LIMITS.utm),
        utmContent: sanitizeBounded(source.utmContent, ATTRIBUTION_LIMITS.utm),
        utmTerm: sanitizeBounded(source.utmTerm, ATTRIBUTION_LIMITS.utm),
        gclid: sanitizeBounded(source.gclid, ATTRIBUTION_LIMITS.clickId),
        fbclid: sanitizeBounded(source.fbclid, ATTRIBUTION_LIMITS.clickId),
    }
}

export function extractBearerToken(authorizationHeader: string | null | undefined): string | null {
    if (!authorizationHeader) return null
    const match = /^Bearer\s+(\S+)$/i.exec(authorizationHeader.trim())
    return match?.[1] ?? null
}

/**
 * Constant-time comparison. Never returns or throws the token value.
 * Missing expected or provided tokens fail closed.
 */
export function verifyIngestToken(
    provided: string | null | undefined,
    expected: string | undefined
): boolean {
    const providedValue = typeof provided === 'string' ? provided : ''
    const expectedValue = typeof expected === 'string' ? expected : ''

    const providedBuf = Buffer.from(providedValue)
    const expectedBuf = Buffer.from(expectedValue)
    const length = Math.max(providedBuf.length, expectedBuf.length, 1)
    const left = Buffer.alloc(length)
    const right = Buffer.alloc(length)
    providedBuf.copy(left)
    expectedBuf.copy(right)

    const sameBytes = timingSafeEqual(left, right)
    return sameBytes && providedBuf.length === expectedBuf.length && expectedValue.length > 0 && providedValue.length > 0
}

function safeIssueMessage(issue: { path: PropertyKey[] } | undefined): string {
    const path = issue?.path?.length ? issue.path.map(String).join('.') : 'payload'
    return `Payload inválido: ${path}`
}

export function parseLeadCapture(input: unknown): ParseLeadCaptureResult {
    const parsed = leadCaptureRequestSchema.safeParse(input)
    if (!parsed.success) {
        return { success: false, error: safeIssueMessage(parsed.error.issues[0]) }
    }

    const whatsapp = normalizeWhatsApp(parsed.data.whatsapp)
    if (!whatsapp) {
        return { success: false, error: 'WhatsApp inválido: informe DDD brasileiro' }
    }

    return {
        success: true,
        data: {
            requestId: parsed.data.requestId,
            name: parsed.data.name,
            city: parsed.data.city,
            email: parsed.data.email.toLowerCase(),
            whatsapp,
            livesCount: parsed.data.livesCount,
            ages: parsed.data.ages,
            consent: true,
            consentAt: new Date(parsed.data.consentAt),
            source: sanitizeAttribution(parsed.data.source),
        },
    }
}

export function buildDealTitle(name: string): string {
    return `Cotação pelo site — ${name.trim()}`
}

export function buildDealNotes(input: {
    city: string
    livesCount: number
    ages: number[]
    source: SanitizedAttribution
}): string {
    const parts = [
        'Cotação recebida pelo site.',
        `Cidade: ${input.city}.`,
        `Vidas: ${input.livesCount}.`,
        `Idades: ${input.ages.join(', ')}.`,
        `Página: ${input.source.pageUrl}.`,
    ]

    if (input.source.referrer) {
        parts.push(`Referrer: ${input.source.referrer}.`)
    }

    const utm = [
        input.source.utmSource && `utm_source=${input.source.utmSource}`,
        input.source.utmMedium && `utm_medium=${input.source.utmMedium}`,
        input.source.utmCampaign && `utm_campaign=${input.source.utmCampaign}`,
        input.source.utmContent && `utm_content=${input.source.utmContent}`,
        input.source.utmTerm && `utm_term=${input.source.utmTerm}`,
    ].filter(Boolean)

    if (utm.length > 0) {
        parts.push(`Atribuição: ${utm.join(' ')}.`)
    }
    if (input.source.gclid) parts.push('gclid presente.')
    if (input.source.fbclid) parts.push('fbclid presente.')

    return parts.join(' ')
}

export function pickBetterContactFields(
    existing: {
        name: string
        email: string | null
        livesCount: number | null
        planInterest: string | null
    },
    incoming: {
        name: string
        email: string
        livesCount: number
    }
): {
    name: string
    email: string
    livesCount: number
    planInterest: string
} {
    const existingName = existing.name.trim()
    const incomingName = incoming.name.trim()

    return {
        name: incomingName.length > existingName.length ? incomingName : existingName,
        email: existing.email?.trim() ? existing.email.trim() : incoming.email,
        livesCount: existing.livesCount ?? incoming.livesCount,
        planInterest: existing.planInterest?.trim() ? existing.planInterest : 'cotacao-site',
    }
}

export function isUniqueViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    return 'code' in error && (error as { code?: unknown }).code === '23505'
}
