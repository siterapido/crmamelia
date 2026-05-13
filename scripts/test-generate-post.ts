/**
 * Test Script: Generate a blog post with AI + Image
 * Run with: npx tsx scripts/test-generate-post.ts
 */

import { streamText, generateImage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Load env vars
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
})

const AI_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'ai-generated')

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

async function generateCoverImage(title: string, excerpt: string): Promise<string | null> {
    try {
        const imagePrompt = `Professional modern healthcare blog cover, ${title}, ${excerpt}, clean welcoming aesthetic, soft green blue white colors, no text no words, photography style, health insurance company`

        console.log('🎨 Generating image via Pollinations.ai...')

        const encodedPrompt = encodeURIComponent(imagePrompt)
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`

        const response = await fetch(pollinationsUrl)

        if (!response.ok) {
            console.error('❌ Pollinations.ai failed:', response.status)
            return null
        }

        const imageBuffer = Buffer.from(await response.arrayBuffer())

        if (!existsSync(AI_UPLOAD_DIR)) {
            await mkdir(AI_UPLOAD_DIR, { recursive: true })
        }

        const timestamp = Date.now()
        const fileName = `test-cover-${timestamp}.png`
        const filePath = join(AI_UPLOAD_DIR, fileName)

        await writeFile(filePath, imageBuffer)

        console.log('✅ Image saved:', filePath)
        return filePath
    } catch (error) {
        console.error('❌ Error generating image:', error)
        return null
    }
}

async function testGeneratePost() {
    console.log('🚀 Testing AI Blog Post Generation\n')

    if (!process.env.OPENROUTER_API_KEY) {
        console.error('❌ OPENROUTER_API_KEY not set in .env.local')
        process.exit(1)
    }

    const topic = 'Os benefícios da telemedicina no dia a dia'
    const category = 'Saúde'
    const tone = 'casual' as const
    const audience = 'geral' as const
    const keywords = ['telemedicina', 'consulta online', 'praticidade']

    console.log('📋 Topic:', topic)
    console.log('🤖 Generating content with Claude...\n')

    const prompt = `Você é um especialista em criação de conteúdo para a Amélia Saúde, uma administradora de benefícios de saúde no Brasil.

Crie um artigo de aproximadamente 800-1000 palavras sobre o tema: "${topic}"

Categoria do artigo: ${category}

Tom de voz: ${TONE_DESCRIPTIONS[tone]}
Público-alvo: ${AUDIENCE_DESCRIPTIONS[audience]}
Palavras-chave para incluir: ${keywords.join(', ')}

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

    try {
        const response = await streamText({
            model: openrouter('openai/gpt-4o-mini'),
            prompt,
        })

        let fullContent = ''
        for await (const chunk of response.textStream) {
            fullContent += chunk
        }

        const cleanContent = fullContent
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

        const generatedPost = JSON.parse(cleanContent)

        console.log('✅ Content generated!')
        console.log('\n📰 Title:', generatedPost.title)
        console.log('📝 Excerpt:', generatedPost.excerpt)
        console.log('🏷️ Tags:', generatedPost.tags?.join(', '))
        console.log('⏱️ Reading time:', generatedPost.readingTime, 'min')
        console.log('\n--- Content Preview (first 500 chars) ---')
        console.log(generatedPost.content?.substring(0, 500) + '...')

        // Generate image
        console.log('\n🎨 Generating cover image...')
        const imagePath = await generateCoverImage(generatedPost.title, generatedPost.excerpt)

        if (imagePath) {
            console.log('✅ Cover image saved to:', imagePath)
        } else {
            console.log('⚠️ No image generated')
        }

        console.log('\n✨ Test completed successfully!')

    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

testGeneratePost()
