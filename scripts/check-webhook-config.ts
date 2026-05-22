import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH || '.env.local') })

const EXPECTED_URL = 'https://crmamelia.vercel.app/api/whatsapp/webhook'
const EXPECTED_EVENTS = ['MESSAGES_UPSERT', 'MESSAGES_UPDATE']

async function main() {
    const apiUrl = (process.env.EVOLUTION_API_URL || '').replace(/\/$/, '')
    const apiKey = process.env.EVOLUTION_API_KEY || ''
    const instance = process.env.EVOLUTION_INSTANCE_NAME || ''
    const headers = { apikey: apiKey, 'Content-Type': 'application/json' }

    if (!apiUrl || !apiKey || !instance) {
        console.error('Missing EVOLUTION_* env vars')
        process.exit(1)
    }

    console.log('Evolution API:', apiUrl)
    console.log('Instance:', instance)
    console.log('Expected webhook URL:', EXPECTED_URL)
    console.log('Expected events:', EXPECTED_EVENTS.join(', '))
    console.log('')

    const stateRes = await fetch(`${apiUrl}/instance/connectionState/${instance}`, { headers })
    const state = await stateRes.json()
    console.log('=== Connection ===')
    console.log(stateRes.status, JSON.stringify(state))

    const whRes = await fetch(`${apiUrl}/webhook/find/${instance}`, { headers })
    const wh = await whRes.json()
    const config = (wh as { webhook?: typeof wh }).webhook ?? wh
    const url = (config as { url?: string }).url || ''
    const enabled = (config as { enabled?: boolean }).enabled ?? false
    const events = (config as { events?: string[] }).events || []

    console.log('\n=== Webhook (GET /webhook/find) ===')
    console.log(JSON.stringify(wh, null, 2))

    console.log('\n=== Validation ===')
    const checks = [
        { ok: enabled, label: `enabled: ${enabled}` },
        { ok: url === EXPECTED_URL, label: `url: ${url || '(empty)'}` },
        { ok: EXPECTED_EVENTS.every((e) => events.includes(e)), label: `events: ${events.join(', ') || '(none)'}` },
        { ok: state?.instance?.state === 'open', label: `instance state: ${state?.instance?.state}` },
    ]
    for (const c of checks) {
        console.log(c.ok ? '✅' : '❌', c.label)
    }

    console.log('\n=== CRM diagnostics ===')
    try {
        const diagRes = await fetch('https://crmamelia.vercel.app/api/whatsapp/diagnostics')
        const diag = await diagRes.json()
        console.log('overall:', (diag as { overall?: string }).overall)
        console.log('evolution_webhook:', JSON.stringify((diag as { checks?: Record<string, unknown> }).checks?.evolution_webhook, null, 2))
    } catch (e) {
        console.log('Could not fetch diagnostics:', e)
    }

    console.log('\n=== Webhook smoke POST (production) ===')
    const smokePayload = {
        event: 'MESSAGES_UPSERT',
        instance,
        data: [
            {
                key: {
                    remoteJid: '5521971724757@s.whatsapp.net',
                    fromMe: false,
                    id: `smoke-${Date.now()}`,
                },
                pushName: 'Smoke Check',
                message: { conversation: 'Smoke test from check-webhook-config' },
            },
        ],
    }
    const smokeRes = await fetch(EXPECTED_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smokePayload),
    })
    const smokeBody = await smokeRes.text()
    console.log('Status:', smokeRes.status)
    console.log('Body:', smokeBody)
    console.log(
        smokeRes.ok && smokeBody.includes('"persisted":1')
            ? '✅ Smoke persisted'
            : '❌ Smoke failed — check deploy'
    )
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
