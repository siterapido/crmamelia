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
    type: 'qualify' | 'update_stage' | 'handoff' | 'schedule_followup'
    field?: string
    value?: string
    stage?: string
    reason?: string
    delay_hours?: number
    message?: string
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

export async function processSDRMessage(
    conversationId: string,
    inboundMessage: string,
    history: Message[],
    contact: Contact
): Promise<SDRResponse> {
    const systemPrompt = buildSDRPrompt(contact, history)

    const { text, usage } = await generateText({
        model: openrouter('google/gemini-2.5-flash-preview'),
        system: systemPrompt,
        prompt: inboundMessage,
        maxOutputTokens: 500,
        temperature: 0.7,
    })

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
        model: 'google/gemini-2.5-flash-preview',
        tokensUsed: (usage?.inputTokens || 0) + (usage?.outputTokens || 0),
    })

    return { reply, actions }
}
