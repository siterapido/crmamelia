/**
 * AI Post Generation API Route
 * POST /api/ai/generate-post
 * 
 * Uses OpenRouter API for AI content generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

// Configure OpenRouter as OpenAI-compatible provider
const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
})

const generatePostSchema = z.object({
    topic: z.string().min(1, 'Tema é obrigatório'),
    category: z.string().optional(),
    tone: z.enum(['formal', 'casual', 'tecnico', 'inspiracional']).default('formal'),
    targetAudience: z.enum(['pacientes', 'empresas', 'rh', 'geral']).default('geral'),
    length: z.enum(['curto', 'medio', 'longo']).default('medio'),
    keywords: z.array(z.string()).optional(),
})

const TONE_DESCRIPTIONS = {
    formal: 'profissional e respeitoso',
    casual: 'amigável e acessível',
    tecnico: 'técnico e detalhado',
    inspiracional: 'motivacional e envolvente',
}

const AUDIENCE_DESCRIPTIONS = {
    pacientes: 'pacientes e beneficiários de planos de saúde',
    empresas: 'gestores e tomadores de decisão de empresas',
    rh: 'profissionais de recursos humanos',
    geral: 'público geral interessado em saúde',
}

const LENGTH_INSTRUCTIONS = {
    curto: 'Crie um artigo conciso de aproximadamente 500 palavras',
    medio: 'Crie um artigo de aproximadamente 1000 palavras',
    longo: 'Crie um artigo detalhado de aproximadamente 2000 palavras',
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            )
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: 'API de IA não configurada' },
                { status: 500 }
            )
        }

        const body = await request.json()
        const result = generatePostSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { topic, category, tone, targetAudience, length, keywords } = result.data

        const prompt = `Você é um especialista em criação de conteúdo para a Amélia Saúde, uma administradora de benefícios de saúde no Brasil.

${LENGTH_INSTRUCTIONS[length]} sobre o tema: "${topic}"

${category ? `Categoria do artigo: ${category}` : ''}

Tom de voz: ${TONE_DESCRIPTIONS[tone]}
Público-alvo: ${AUDIENCE_DESCRIPTIONS[targetAudience]}
${keywords && keywords.length > 0 ? `Palavras-chave para incluir: ${keywords.join(', ')}` : ''}

Diretrizes:
- Escreva em português brasileiro
- Use linguagem clara e acessível
- Inclua informações úteis e práticas
- Mencione a Amélia Saúde de forma natural quando relevante
- Estruture o conteúdo com títulos e subtítulos
- Inclua uma introdução envolvente
- Termine com uma conclusão que inclua um call-to-action

Formato de resposta:
Retorne o conteúdo em JSON com a seguinte estrutura:
{
  "title": "Título atraente e otimizado para SEO",
  "excerpt": "Resumo de 2-3 linhas para preview",
  "content": "Conteúdo completo em HTML com tags <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": número estimado de minutos de leitura
}

Retorne APENAS o JSON, sem markdown ou texto adicional.`

        const response = await streamText({
            model: openrouter('anthropic/claude-sonnet-4-20250514'),
            prompt,
        })

        // Collect the full response
        let fullContent = ''
        for await (const chunk of response.textStream) {
            fullContent += chunk
        }

        // Parse JSON response
        try {
            // Remove potential markdown code blocks
            const cleanContent = fullContent
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()

            const generatedPost = JSON.parse(cleanContent)

            return NextResponse.json({
                success: true,
                post: generatedPost,
            })
        } catch {
            console.error('Failed to parse AI response:', fullContent)
            return NextResponse.json(
                { error: 'Erro ao processar resposta da IA' },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Error generating post:', error)
        return NextResponse.json(
            { error: 'Erro ao gerar post com IA' },
            { status: 500 }
        )
    }
}
