/**
 * AI Post Generation API Route
 * POST /api/ai/generate-post
 * 
 * Uses OpenRouter API for AI content generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { streamText, generateImage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Configure OpenRouter as OpenAI-compatible provider
const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
})

const AI_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'ai-generated')

async function generateCoverImage(title: string, excerpt: string): Promise<string | null> {
    if (!process.env.OPENROUTER_API_KEY) {
        console.log('⚠️ OPENROUTER_API_KEY not set, skipping image generation')
        return null
    }

    try {
        const imagePrompt = `Create a professional, modern cover image for a health and wellness blog post.
Title: "${title}"
Topic: ${excerpt}

Style: Clean, modern, welcoming healthcare aesthetic with soft colors (greens, blues, whites). Professional photography style. No text or words in the image. Suitable for a Brazilian health insurance company blog.`

        const { image } = await generateImage({
            model: openrouter.image('openai/gpt-5-image-mini'),
            prompt: imagePrompt,
            size: '1024x1024',
        })

        if (!image || !image.base64) {
            console.error('No image data returned from OpenRouter')
            return null
        }

        // Ensure directory exists
        if (!existsSync(AI_UPLOAD_DIR)) {
            await mkdir(AI_UPLOAD_DIR, { recursive: true })
        }

        // Save image
        const timestamp = Date.now()
        const fileName = `post-cover-${timestamp}.png`
        const filePath = join(AI_UPLOAD_DIR, fileName)

        const buffer = Buffer.from(image.base64, 'base64')
        await writeFile(filePath, buffer)

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ameliasaude.vercel.app'
        const imageUrl = `${baseUrl}/uploads/ai-generated/${fileName}`

        console.log('✅ Cover image generated:', imageUrl)
        return imageUrl
    } catch (error) {
        console.error('Error generating cover image:', error)
        return null
    }
}

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

            // Generate cover image
            console.log('🎨 Generating cover image for post:', generatedPost.title)
            const coverImage = await generateCoverImage(
                generatedPost.title,
                generatedPost.excerpt
            )

            if (coverImage) {
                generatedPost.coverImage = coverImage
            }

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
