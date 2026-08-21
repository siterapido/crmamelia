import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
    buildDealNotes,
    buildDealTitle,
    extractBearerToken,
    isUniqueViolation,
    leadCaptureRequestSchema,
    normalizeWhatsApp,
    parseLeadCapture,
    pickBetterContactFields,
    sanitizeAttribution,
    verifyIngestToken,
} from '../lib/crm/lead-capture'

const validPayload = {
    requestId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Maria Silva',
    city: 'Rio de Janeiro',
    email: 'maria@example.com',
    whatsapp: '(21) 98888-7777',
    livesCount: 2,
    ages: [34, 8],
    consent: true as const,
    consentAt: '2026-08-13T15:30:00.000Z',
    source: {
        pageUrl: 'https://ameliasaude.com.br/lp?utm_source=google',
        referrer: 'https://www.google.com/',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'cotacao',
        utmContent: 'ad1',
        utmTerm: 'plano saude',
        gclid: 'Cj0KCQjw',
        fbclid: 'IwAR0abc',
    },
}

describe('leadCaptureRequestSchema', () => {
    it('accepts a valid public lead payload', () => {
        const result = leadCaptureRequestSchema.safeParse(validPayload)
        assert.equal(result.success, true)
    })

    it('rejects a non-uuid requestId', () => {
        const result = leadCaptureRequestSchema.safeParse({ ...validPayload, requestId: 'not-a-uuid' })
        assert.equal(result.success, false)
    })

    it('rejects name shorter than 2 or longer than 120', () => {
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, name: 'A' }).success, false)
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, name: 'x'.repeat(121) }).success, false)
    })

    it('rejects city shorter than 2 or longer than 120', () => {
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, city: 'R' }).success, false)
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, city: 'c'.repeat(121) }).success, false)
    })

    it('rejects invalid email', () => {
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, email: 'nao-e-email' }).success, false)
    })

    it('accepts empty email', () => {
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, email: '' }).success, true)
        const parsed = parseLeadCapture({ ...validPayload, email: '' })
        assert.equal(parsed.success, true)
        if (!parsed.success) return
        assert.equal(parsed.data.email, null)
    })

    it('rejects livesCount outside 1..99', () => {
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, livesCount: 0, ages: [] }).success, false)
        assert.equal(
            leadCaptureRequestSchema.safeParse({ ...validPayload, livesCount: 100, ages: Array(100).fill(1) }).success,
            false
        )
    })

    it('rejects ages whose length differs from livesCount', () => {
        const result = leadCaptureRequestSchema.safeParse({ ...validPayload, livesCount: 2, ages: [30] })
        assert.equal(result.success, false)
    })

    it('rejects ages outside 0..120', () => {
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, livesCount: 1, ages: [-1] }).success, false)
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, livesCount: 1, ages: [121] }).success, false)
    })

    it('rejects consent that is not true', () => {
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, consent: false }).success, false)
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, consent: undefined }).success, false)
    })

    it('rejects consentAt that is not an ISO datetime', () => {
        assert.equal(leadCaptureRequestSchema.safeParse({ ...validPayload, consentAt: 'ontem' }).success, false)
    })

    it('rejects invalid pageUrl', () => {
        assert.equal(
            leadCaptureRequestSchema.safeParse({
                ...validPayload,
                source: { ...validPayload.source, pageUrl: 'not-a-url' },
            }).success,
            false
        )
    })

    it('accepts empty referrer string and rejects a non-url referrer', () => {
        assert.equal(
            leadCaptureRequestSchema.safeParse({
                ...validPayload,
                source: { ...validPayload.source, referrer: '' },
            }).success,
            true
        )
        assert.equal(
            leadCaptureRequestSchema.safeParse({
                ...validPayload,
                source: { ...validPayload.source, referrer: 'not a url' },
            }).success,
            false
        )
    })
})

describe('normalizeWhatsApp', () => {
    it('normalizes formatted Brazilian mobile with DDD to digits with country code', () => {
        assert.equal(normalizeWhatsApp('(21) 98888-7777'), '5521988887777')
        assert.equal(normalizeWhatsApp('11 99999-8888'), '5511999998888')
    })

    it('keeps an already-normalized 55 number', () => {
        assert.equal(normalizeWhatsApp('5521988887777'), '5521988887777')
        assert.equal(normalizeWhatsApp('+55 21 98888-7777'), '5521988887777')
    })

    it('strips trunk prefix 0 without inventing a DDD', () => {
        assert.equal(normalizeWhatsApp('021 98888-7777'), '5521988887777')
        assert.equal(normalizeWhatsApp('+55 021 98888-7777'), '5521988887777')
    })

    it('does not invent a DDD for subscriber-only numbers', () => {
        assert.equal(normalizeWhatsApp('98888-7777'), null)
        assert.equal(normalizeWhatsApp('88887777'), null)
        assert.equal(normalizeWhatsApp('988887777'), null)
    })

    it('rejects numbers that are not valid Brazilian E.164-ish', () => {
        assert.equal(normalizeWhatsApp(''), null)
        assert.equal(normalizeWhatsApp('123'), null)
        assert.equal(normalizeWhatsApp('+1 415 555 2671'), null)
        assert.equal(normalizeWhatsApp('0800 000 5123'), null)
    })

    it('accepts landline with DDD', () => {
        assert.equal(normalizeWhatsApp('(21) 3333-4444'), '552133334444')
    })
})

describe('sanitizeAttribution', () => {
    it('keeps valid attribution fields within limits', () => {
        const sanitized = sanitizeAttribution(validPayload.source)
        assert.equal(sanitized.pageUrl, validPayload.source.pageUrl)
        assert.equal(sanitized.referrer, validPayload.source.referrer)
        assert.equal(sanitized.utmSource, 'google')
        assert.equal(sanitized.gclid, 'Cj0KCQjw')
        assert.equal(sanitized.fbclid, 'IwAR0abc')
    })

    it('truncates oversized UTM and click ids and strips control characters', () => {
        const sanitized = sanitizeAttribution({
            pageUrl: 'https://ameliasaude.com.br/lp',
            referrer: '',
            utmSource: `${'a'.repeat(250)}\u0001`,
            utmMedium: 'cpc\u0007x',
            gclid: 'g'.repeat(400),
            fbclid: 'f'.repeat(400),
        })
        assert.equal(sanitized.referrer, null)
        assert.ok(sanitized.utmSource && sanitized.utmSource.length <= 200)
        assert.ok(!sanitized.utmSource.includes('\u0001'))
        assert.equal(sanitized.utmMedium, 'cpcx')
        assert.ok(sanitized.gclid && sanitized.gclid.length <= 255)
        assert.ok(sanitized.fbclid && sanitized.fbclid.length <= 255)
    })
})

describe('verifyIngestToken', () => {
    it('accepts a matching bearer token in constant-time comparison', () => {
        assert.equal(verifyIngestToken('secret-token-value', 'secret-token-value'), true)
    })

    it('rejects missing, empty or mismatched tokens without leaking the expected value', () => {
        const expected = 'super-secret-ingest-token'
        assert.equal(verifyIngestToken(null, expected), false)
        assert.equal(verifyIngestToken(undefined, expected), false)
        assert.equal(verifyIngestToken('', expected), false)
        assert.equal(verifyIngestToken('wrong-token', expected), false)
        assert.equal(verifyIngestToken(expected, undefined), false)
        assert.equal(verifyIngestToken(expected, ''), false)
        assert.equal(verifyIngestToken('short', expected), false)
    })

    it('does not include token material in extractBearerToken failures', () => {
        assert.equal(extractBearerToken(null), null)
        assert.equal(extractBearerToken('Basic abc'), null)
        assert.equal(extractBearerToken('Bearer'), null)
        assert.equal(extractBearerToken('Bearer real-token'), 'real-token')
    })
})

describe('parseLeadCapture', () => {
    it('returns normalized whatsapp and sanitized source on success', () => {
        const result = parseLeadCapture(validPayload)
        assert.equal(result.success, true)
        if (!result.success) return
        assert.equal(result.data.whatsapp, '5521988887777')
        assert.equal(result.data.name, 'Maria Silva')
        assert.equal(result.data.source.utmSource, 'google')
        assert.ok(result.data.consentAt instanceof Date)
    })

    it('fails when whatsapp has no DDD instead of inventing one', () => {
        const result = parseLeadCapture({ ...validPayload, whatsapp: '98888-7777' })
        assert.equal(result.success, false)
        if (result.success) return
        assert.match(result.error, /whatsapp|telefone|ddd/i)
    })

    it('fails with a non-leaking message on invalid payload', () => {
        const result = parseLeadCapture({ ...validPayload, email: 'bad' })
        assert.equal(result.success, false)
        if (result.success) return
        assert.equal(result.error.includes('maria@example.com'), false)
        assert.equal(result.error.includes('98888'), false)
    })
})

describe('contact and deal helpers', () => {
    it('builds a factual deal title from the lead name', () => {
        assert.equal(buildDealTitle('Maria Silva'), 'Cotação pelo site — Maria Silva')
    })

    it('builds notes with city, lives and attribution and without secrets', () => {
        const notes = buildDealNotes({
            city: 'Niterói',
            livesCount: 3,
            ages: [40, 38, 10],
            source: {
                pageUrl: 'https://ameliasaude.com.br/lp',
                referrer: 'https://instagram.com/',
                utmSource: 'ig',
                utmMedium: 'social',
                utmCampaign: 'verao',
                utmContent: null,
                utmTerm: null,
                gclid: null,
                fbclid: 'abc',
            },
        })
        assert.match(notes, /Niterói/)
        assert.match(notes, /3/)
        assert.match(notes, /40, 38, 10/)
        assert.match(notes, /ameliasaude.com.br/)
        assert.equal(notes.includes('CRM_INGEST_TOKEN'), false)
        assert.equal(notes.includes('Bearer'), false)
    })

    it('keeps better existing contact fields and fills gaps', () => {
        const picked = pickBetterContactFields(
            { name: 'M', email: null, livesCount: null, planInterest: null },
            { name: 'Maria Silva', email: 'maria@example.com', livesCount: 2 }
        )
        assert.equal(picked.name, 'Maria Silva')
        assert.equal(picked.email, 'maria@example.com')
        assert.equal(picked.livesCount, 2)
        assert.equal(picked.planInterest, 'cotacao-site')

        const kept = pickBetterContactFields(
            { name: 'Maria Silva Santos', email: 'old@example.com', livesCount: 5, planInterest: 'empresarial' },
            { name: 'Maria', email: 'new@example.com', livesCount: 2 }
        )
        assert.equal(kept.name, 'Maria Silva Santos')
        assert.equal(kept.email, 'old@example.com')
        assert.equal(kept.livesCount, 5)
        assert.equal(kept.planInterest, 'empresarial')
    })

    it('detects postgres unique violations without inspecting message PII', () => {
        assert.equal(isUniqueViolation({ code: '23505' }), true)
        assert.equal(isUniqueViolation(new Error('duplicate key')), false)
        assert.equal(isUniqueViolation(null), false)
    })
})
