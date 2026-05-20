/**
 * AI SDR Agent Processor
 * Processes incoming messages and generates intelligent responses
 */

import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { buildSDRPrompt } from './sdr-prompt'
import { db } from '@/lib/db'
import { aiInteractions } from '@/lib/db/schema'
import type { Contact, Message } from '@/lib/db/schema'

export interface SDRAction {
    type: 'qualify' | 'update_stage' | 'handoff' | 'schedule_followup' | 'score_lead'
    field?: string
    value?: string
    stage?: string
    reason?: string
    delay_hours?: number
    message?: string
    score?: number
}

export interface SDRResponse {
    reply: string
    actions: SDRAction[]
}

const sdrActionSchema = z.object({
    type: z.enum(['qualify', 'update_stage', 'handoff', 'schedule_followup', 'score_lead']),
    field: z.string().optional(),
    value: z.string().optional(),
    stage: z.string().optional(),
    reason: z.string().optional(),
    delay_hours: z.number().optional(),
    message: z.string().optional(),
    score: z.number().optional(),
})

const sdrResponseSchema = z.object({
    reply: z.string().min(1),
    actions: z.array(sdrActionSchema).default([]),
})

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
    headers: {
        'HTTP-Referer': 'https://ameliasaude.com.br',
        'X-Title': 'Amelia Saude SDR Agent',
    },
})

const SDR_MODEL = 'google/gemini-3.1-flash-lite'
const SDR_TIMEOUT_MS = 20_000

export async function processSDRMessage(
    conversationId: string,
    inboundMessage: string,
    history: Message[],
    contact: Contact
): Promise<SDRResponse> {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not set. Cannot process AI messages.')
    }

    const systemPrompt = buildSDRPrompt(contact, history)
    console.log(`[SDR] Calling OpenRouter (${SDR_MODEL}) for conversation ${conversationId}...`)

    const aiPromise = generateObject({
        model: openrouter(SDR_MODEL),
        schema: sdrResponseSchema,
        system: systemPrompt,
        prompt: inboundMessage,
        maxOutputTokens: 500,
        temperature: 0.7,
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('SDR processing timeout')), SDR_TIMEOUT_MS)
    )

    let object: z.infer<typeof sdrResponseSchema>
    let usage: { inputTokens?: number; outputTokens?: number } | undefined

    try {
        const result = await Promise.race([aiPromise, timeoutPromise])
        object = result.object
        usage = result.usage as { inputTokens?: number; outputTokens?: number } | undefined
        console.log(`[SDR] OpenRouter responded. Tokens: ${(usage?.inputTokens || 0) + (usage?.outputTokens || 0)}`)
    } catch (apiError) {
        const msg = apiError instanceof Error ? apiError.message : String(apiError)
        console.error(`[SDR] ❌ OpenRouter API call failed: ${msg}`)
        if (msg.includes('401') || msg.includes('Unauthorized')) {
            throw new Error('OpenRouter API key is invalid or expired. Check OPENROUTER_API_KEY.')
        }
        if (msg.includes('429') || msg.includes('rate limit')) {
            throw new Error('OpenRouter rate limit exceeded. Try again later or upgrade plan.')
        }
        if (msg.includes('402') || msg.includes('insufficient')) {
            throw new Error('OpenRouter account has no credits. Add credits at openrouter.ai.')
        }
        if (msg.includes('timeout')) {
            throw new Error('OpenRouter timeout - try again later')
        }
        throw new Error(`OpenRouter API error: ${msg}`)
    }

    const reply = object.reply.trim()
    const actions = object.actions as SDRAction[]

    if (!reply) {
        throw new Error('SDR agent returned empty reply')
    }

    const primaryAction = actions[0]?.type || 'respond'
    await db.insert(aiInteractions).values({
        conversationId,
        action: primaryAction,
        inputSummary: inboundMessage.slice(0, 500),
        outputSummary: reply.slice(0, 500),
        confidence: actions.length > 0 ? 80 : 60,
        model: SDR_MODEL,
        tokensUsed: (usage?.inputTokens || 0) + (usage?.outputTokens || 0),
    })

    return { reply, actions }
}
