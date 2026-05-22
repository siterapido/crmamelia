/**
 * POST a sample Evolution webhook payload to production (or local).
 * Usage: npx tsx scripts/test-webhook-post.ts [baseUrl] [mode]
 * Modes: valid (default) | lid
 */
const baseUrl = process.argv[2] || 'https://crmamelia.vercel.app'
const mode = process.argv[3] || 'valid'

const payloads: Record<string, object> = {
    valid: {
        event: 'MESSAGES_UPSERT',
        instance: 'amelia1',
        data: [
            {
                key: {
                    remoteJid: '5584986174829@s.whatsapp.net',
                    fromMe: false,
                    id: `test-${Date.now()}`,
                },
                pushName: 'Webhook Test',
                message: { conversation: 'Teste automático do pipeline webhook (array + MESSAGES_UPSERT)' },
                messageType: 'conversation',
            },
        ],
    },
    lid: {
        event: 'MESSAGES_UPSERT',
        instance: 'amelia1',
        data: [
            {
                key: {
                    remoteJid: '123456789@lid',
                    fromMe: false,
                    id: `test-lid-${Date.now()}`,
                },
                pushName: 'LID Test',
                message: { conversation: 'Teste @lid' },
            },
        ],
    },
}

const payload = payloads[mode] ?? payloads.valid

async function main() {
    const url = `${baseUrl.replace(/\/$/, '')}/api/whatsapp/webhook`
    console.log('Mode:', mode)
    console.log('POST', url)
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    const text = await res.text()
    console.log('Status:', res.status)
    console.log('Body:', text)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
