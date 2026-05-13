/**
 * Test OpenRouter Image Generation
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testImageGeneration() {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
        console.error('OPENROUTER_API_KEY not set')
        return
    }

    console.log('Testing OpenRouter image generation...')

    try {
        const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ameliasaude.com.br',
                'X-Title': 'Amelia Saude Blog',
            },
            body: JSON.stringify({
                model: 'openai/gpt-5-image-mini',
                prompt: 'A professional healthcare blog cover image with soft green and blue colors, modern and welcoming. No text.',
                n: 1,
                size: '1024x1024',
                response_format: 'b64_json',
            }),
        })

        console.log('Status:', response.status)
        console.log('Headers:', Object.fromEntries(response.headers.entries()))

        const data = await response.json()
        console.log('Response:', JSON.stringify(data, null, 2))

        if (response.ok && data.data?.[0]?.b64_json) {
            console.log('✅ Image generated successfully!')
        } else {
            console.log('❌ Failed to generate image')
        }
    } catch (error) {
        console.error('Error:', error)
    }
}

testImageGeneration()
