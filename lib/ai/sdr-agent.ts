/**
 * AI SDR Agent Processor
 * Processes incoming messages and generates intelligent responses
 */

import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
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

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
    headers: {
        'HTTP-Referer': 'https://sixsaude.com.br',
        'X-Title': 'SIX Saude SDR Agent',
    },
})

const SDR_TIMEOUT_MS = 6000

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
    console.log(`[SDR] Calling OpenRouter (google/gemini-2.0-flash-001) for conversation ${conversationId}...`)

    let text: string
    let usage: { inputTokens?: number; outputTokens?: number } | undefined

    const aiPromise = generateText({
        model: openrouter('google/gemini-2.0-flash-001'),
        system: systemPrompt,
        prompt: inboundMessage,
        maxOutputTokens: 500,
        temperature: 0.7,
    })

    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SDR processing timeout')), SDR_TIMEOUT_MS)
    )

    try {
        const result = await Promise.race([aiPromise, timeoutPromise]) as Awaited<ReturnType<typeof generateText>>
        text = result.text
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

    // Parse structured response
    let reply = ''
    let actions: SDRAction[] = []

    try {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            reply = parsed.reply || ''
            actions = Array.isArray(parsed.actions) ? parsed.actions : []
        } else {
            // Fallback: use raw text as reply
            reply = text.trim()
        }
    } catch {
        // If JSON parsing fails, use text as-is
        reply = text.replace(/```json\n?|\n?```/g, '').trim()
        try {
            const parsed = JSON.parse(reply)
            reply = parsed.reply || reply
            actions = parsed.actions || []
        } catch {
            // Just use the text directly
        }
    }

    // Log AI interaction
    const primaryAction = actions[0]?.type || 'respond'
    await db.insert(aiInteractions).values({
        conversationId,
        action: primaryAction,
        inputSummary: inboundMessage.slice(0, 500),
        outputSummary: reply.slice(0, 500),
        confidence: actions.length > 0 ? 80 : 60,
        model: 'google/gemini-2.0-flash-001',
        tokensUsed: (usage?.inputTokens || 0) + (usage?.outputTokens || 0),
    })

    return { reply, actions }
}
