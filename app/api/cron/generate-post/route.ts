/**
 * Cron Job: Daily AI Blog Post Generation
 * Runs once per day via Vercel Cron
 * Automatically generates a blog post with AI text + AI image
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, categories, authors, postTags } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { streamText, generateImage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Configure OpenRouter as OpenAI-compatible provider
const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
})

const AI_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'ai-generated')

// Predefined topics for rotation
const TOPIC_POOL = [
    {
        topic: 'Como escolher o melhor plano de saúde para sua família',
        category: 'Planos',
        tone: 'formal' as const,
        audience: 'pacientes' as const,
        keywords: ['planos de saúde', 'família', 'cobertura médica'],
    },
    {
        topic: 'Os benefícios da telemedicina no dia a dia',
        category: 'Saúde',
        tone: 'casual' as const,
        audience: 'geral' as const,
        keywords: ['telemedicina', 'consulta online', 'praticidade'],
    },
    {
        topic: 'Saúde mental no ambiente corporativo: como as empresas podem ajudar',
        category: 'Bem-estar',
        tone: 'inspiracional' as const,
        audience: 'empresas' as const,
        keywords: ['saúde mental', 'corporativo', 'bem-estar'],
    },
    {
        topic: 'Check-up anual: por que fazer e quais exames não podem faltar',
        category: 'Saúde',
        tone: 'formal' as const,
        audience: 'pacientes' as const,
        keywords: ['check-up', 'prevenção', 'exames'],
    },
    {
        topic: 'Plano odontológico: vale a pena ter um?',
        category: 'Planos',
        tone: 'casual' as const,
        audience: 'geral' as const,
        keywords: ['plano odontológico', 'dentista', 'saúde bucal'],
    },
    {
        topic: 'Dicas de alimentação saudável para aumentar a imunidade',
        category: 'Bem-estar',
        tone: 'inspiracional' as const,
        audience: 'geral' as const,
        keywords: ['nutrição', 'imunidade', 'alimentação saudável'],
    },
    {
        topic: 'Entenda as carências do seu plano de saúde',
        category: 'Planos',
        tone: 'tecnico' as const,
        audience: 'pacientes' as const,
        keywords: ['carência', 'ANS', 'direitos do consumidor'],
    },
    {
        topic: 'Atividade física em casa: exercícios simples para começar',
        category: 'Bem-estar',
        tone: 'casual' as const,
        audience: 'geral' as const,
        keywords: ['exercícios', 'atividade física', 'saúde'],
    },
    {
        topic: 'Como a Amélia Saúde está inovando no mercado de benefícios',
        category: 'Institucional',
        tone: 'formal' as const,
        audience: 'empresas' as const,
        keywords: ['inovação', 'tecnologia', 'benefícios'],
    },
    {
        topic: 'Cuidados preventivos que todo adulto deve ter',
        category: 'Saúde',
        tone: 'formal' as const,
        audience: 'pacientes' as const,
        keywords: ['prevenção', 'check-up', 'saúde do adulto'],
    },
]

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

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

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

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Check if API key is configured
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: 'OPENROUTER_API_KEY not configured' },
                { status: 500 }
            )
        }

        // Select random topic
        const topicConfig = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)]
        console.log('📝 Selected topic:', topicConfig.topic)

        // Find category
        let categoryId: string | undefined
        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.name, topicConfig.category))
            .limit(1)

        if (category) {
            categoryId = category.id
            console.log('📁 Category found:', category.name)
        } else {
            console.log('⚠️ Category not found:', topicConfig.category)
        }

        // Find default author
        let authorId: string | undefined
        const [author] = await db
            .select()
            .from(authors)
            .where(eq(authors.email, 'blog@ameliasaude.com.br'))
            .limit(1)

        if (author) {
            authorId = author.id
        } else {
            console.log('⚠️ Default author not found, creating post without author')
        }

        // Generate content
        const prompt = `Você é um especialista em criação de conteúdo para a Amélia Saúde, uma administradora de benefícios de saúde no Brasil.

Crie um artigo de aproximadamente 800-1000 palavras sobre o tema: "${topicConfig.topic}"

${categoryId ? `Categoria do artigo: ${topicConfig.category}` : ''}

Tom de voz: ${TONE_DESCRIPTIONS[topicConfig.tone]}
Público-alvo: ${AUDIENCE_DESCRIPTIONS[topicConfig.audience]}
${topicConfig.keywords.length > 0 ? `Palavras-chave para incluir: ${topicConfig.keywords.join(', ')}` : ''}

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

        console.log('🤖 Generating content with AI...')
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
        let generatedPost: {
            title: string
            excerpt: string
            content: string
            tags: string[]
            readingTime: number
        }

        try {
            const cleanContent = fullContent
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()

            generatedPost = JSON.parse(cleanContent)
        } catch {
            console.error('Failed to parse AI response:', fullContent)
            return NextResponse.json(
                { error: 'Failed to parse AI response' },
                { status: 500 }
            )
        }

        // Generate slug
        const slug = slugify(generatedPost.title)

        // Check if slug already exists
        const [existing] = await db
            .select({ id: posts.id })
            .from(posts)
            .where(eq(posts.slug, slug))
            .limit(1)

        if (existing) {
            return NextResponse.json(
                { error: 'Post with similar title already exists' },
                { status: 409 }
            )
        }

        // Generate cover image
        console.log('🎨 Generating cover image...')
        const coverImage = await generateCoverImage(
            generatedPost.title,
            generatedPost.excerpt
        )

        // Create post
        console.log('💾 Saving post to database...')
        const [newPost] = await db
            .insert(posts)
            .values({
                title: generatedPost.title,
                slug,
                excerpt: generatedPost.excerpt,
                content: generatedPost.content,
                coverImage,
                categoryId,
                authorId,
                status: 'published',
                publishedAt: new Date(),
                readingTime: generatedPost.readingTime || 5,
                featured: false,
                aiGenerated: true,
            })
            .returning()

        // Create tags
        if (generatedPost.tags && generatedPost.tags.length > 0) {
            await db.insert(postTags).values(
                generatedPost.tags.map((tag) => ({
                    postId: newPost.id,
                    tag,
                }))
            )
        }

        console.log('✅ Post created successfully:', newPost.id)

        return NextResponse.json({
            success: true,
            post: {
                id: newPost.id,
                title: newPost.title,
                slug: newPost.slug,
                coverImage: newPost.coverImage,
                publishedAt: newPost.publishedAt,
            },
        })
    } catch (error) {
        console.error('Cron generate-post error:', error)
        return NextResponse.json(
            { error: 'Internal error' },
            { status: 500 }
        )
    }
}
