/**
 * Configure Evolution API webhook for production CRM.
 * Usage: npx tsx scripts/setup-evolution-webhook.ts
 * Optional: WEBHOOK_URL=https://crmamelia.vercel.app/api/whatsapp/webhook
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

const envFile = process.env.DOTENV_CONFIG_PATH || '.env.local'
dotenv.config({ path: resolve(process.cwd(), envFile) })

const DEFAULT_WEBHOOK_URL = 'https://crmamelia.vercel.app/api/whatsapp/webhook'
const WEBHOOK_EVENTS = ['MESSAGES_UPSERT', 'MESSAGES_UPDATE'] as const

function getConfig() {
    const apiUrl = (process.env.EVOLUTION_API_URL || '').replace(/\/$/, '')
    const apiKey = process.env.EVOLUTION_API_KEY || ''
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME || ''
    const webhookUrl = (process.env.WEBHOOK_URL || DEFAULT_WEBHOOK_URL).trim()

    if (!apiUrl || !apiKey || !instanceName) {
        console.error('Missing EVOLUTION_API_URL, EVOLUTION_API_KEY, or EVOLUTION_INSTANCE_NAME')
        process.exit(1)
    }

    return { apiUrl, apiKey, instanceName, webhookUrl }
}

async function evolutionFetch<T>(
    apiUrl: string,
    apiKey: string,
    path: string,
    options: { method?: string; body?: Record<string, unknown> } = {}
): Promise<T> {
    const res = await fetch(`${apiUrl}${path}`, {
        method: options.method || 'GET',
        headers: {
            apikey: apiKey,
            'Content-Type': 'application/json',
        },
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    })

    const text = await res.text()
    let data: T
    try {
        data = JSON.parse(text) as T
    } catch {
        throw new Error(`Invalid JSON (${res.status}): ${text.slice(0, 200)}`)
    }

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`)
    }

    return data
}

async function main() {
    const { apiUrl, apiKey, instanceName, webhookUrl } = getConfig()

    console.log('Evolution API:', apiUrl)
    console.log('Instance:', instanceName)
    console.log('Target webhook URL:', webhookUrl)

    const state = await evolutionFetch<{ instance?: { state?: string } }>(
        apiUrl,
        apiKey,
        `/instance/connectionState/${instanceName}`
    )
    const connectionState = state.instance?.state || 'unknown'
    console.log('Connection state:', connectionState)

    if (connectionState !== 'open') {
        console.warn('Warning: instance is not open. Webhook will still be set.')
    }

    console.log('\nSetting webhook...')
    await evolutionFetch(apiUrl, apiKey, `/webhook/set/${instanceName}`, {
        method: 'POST',
        body: {
            webhook: {
                enabled: true,
                url: webhookUrl,
                webhookByEvents: false,
                webhookBase64: false,
                events: [...WEBHOOK_EVENTS],
            },
        },
    })
    console.log('Webhook set OK')

    console.log('\nVerifying webhook...')
    const found = await evolutionFetch<{
        url?: string
        enabled?: boolean
        events?: string[]
        webhook?: { url?: string; enabled?: boolean; events?: string[] }
    }>(apiUrl, apiKey, `/webhook/find/${instanceName}`)

    const config = found.webhook ?? found
    const configuredUrl = config.url || ''
    const enabled = config.enabled ?? false
    const events = config.events || []

    console.log('Configured URL:', configuredUrl || '(empty)')
    console.log('Enabled:', enabled)
    console.log('Events:', events.join(', ') || '(none)')

    const urlOk = configuredUrl === webhookUrl
    const eventsOk = WEBHOOK_EVENTS.every((e) => events.includes(e))

    if (!urlOk || !enabled || !eventsOk) {
        console.error('\nVerification failed:')
        if (!urlOk) console.error(`  URL mismatch: expected ${webhookUrl}`)
        if (!enabled) console.error('  Webhook not enabled')
        if (!eventsOk) console.error(`  Missing events. Expected: ${WEBHOOK_EVENTS.join(', ')}`)
        process.exit(1)
    }

    console.log('\nWebhook configured and verified successfully.')
}

main().catch((err) => {
    console.error('Setup failed:', err instanceof Error ? err.message : err)
    process.exit(1)
})
