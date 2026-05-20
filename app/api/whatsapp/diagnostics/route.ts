/**
 * WhatsApp Pipeline Diagnostics Endpoint
 * GET /api/whatsapp/diagnostics — checks all components of the pipeline
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function GET() {
    const diagnostics: Record<string, { status: string; detail?: string }> = {}

    // 1. Check env vars
    const envChecks = {
        EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
        EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ? '***set***' : undefined,
        EVOLUTION_INSTANCE_NAME: process.env.EVOLUTION_INSTANCE_NAME,
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '***set***' : undefined,
    }

    for (const [key, value] of Object.entries(envChecks)) {
        if (!value) {
            diagnostics[key] = { status: '❌ MISSING' }
        } else {
            diagnostics[key] = { status: '✅ OK', detail: key === 'EVOLUTION_API_URL' || key === 'EVOLUTION_INSTANCE_NAME' ? String(value) : undefined }
        }
    }

    // Warn if localhost
    if (process.env.EVOLUTION_API_URL?.includes('localhost')) {
        diagnostics['EVOLUTION_API_URL'].status = '⚠️ WARNING'
        diagnostics['EVOLUTION_API_URL'].detail = `${process.env.EVOLUTION_API_URL} — localhost will NOT work in production/Vercel`
    }

    // 2. Check database connection
    try {
        const result = await db.select({ count: sql<number>`count(*)` }).from(contacts)
        diagnostics['database'] = { status: '✅ OK', detail: `${result[0]?.count || 0} contacts in DB` }
    } catch (err) {
        diagnostics['database'] = { status: '❌ ERROR', detail: err instanceof Error ? err.message : String(err) }
    }

    // 3. Check Evolution API connection
    try {
        const apiUrl = process.env.EVOLUTION_API_URL
        const apiKey = process.env.EVOLUTION_API_KEY
        const instance = process.env.EVOLUTION_INSTANCE_NAME

        if (apiUrl && apiKey && instance) {
            const url = `${apiUrl.replace(/\/$/, '')}/instance/connectionState/${instance}`
            const res = await fetch(url, {
                headers: { 'apikey': apiKey },
                signal: AbortSignal.timeout(5000),
            })

            if (res.ok) {
                const data = await res.json()
                const state = data?.instance?.state || data?.state || 'unknown'
                diagnostics['evolution_api'] = {
                    status: state === 'open' ? '✅ CONNECTED' : `⚠️ ${state.toUpperCase()}`,
                    detail: `Instance: ${instance} | State: ${state}`,
                }
            } else {
                const text = await res.text()
                diagnostics['evolution_api'] = { status: '❌ ERROR', detail: `HTTP ${res.status}: ${text.slice(0, 200)}` }
            }
        } else {
            diagnostics['evolution_api'] = { status: '⏭️ SKIPPED', detail: 'Missing env vars' }
        }
    } catch (err) {
        diagnostics['evolution_api'] = {
            status: '❌ UNREACHABLE',
            detail: err instanceof Error ? err.message : String(err),
        }
    }

    // 4. Check Evolution webhook points to this deployment
    const expectedWebhookUrl =
        process.env.WEBHOOK_URL ||
        (process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/whatsapp/webhook`
            : 'https://crmamelia.vercel.app/api/whatsapp/webhook')

    try {
        const apiUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, '')
        const apiKey = process.env.EVOLUTION_API_KEY
        const instance = process.env.EVOLUTION_INSTANCE_NAME

        if (apiUrl && apiKey && instance) {
            const res = await fetch(`${apiUrl}/webhook/find/${instance}`, {
                headers: { apikey: apiKey },
                signal: AbortSignal.timeout(5000),
            })

            if (res.ok) {
                const data = await res.json()
                const config = data?.webhook ?? data
                const configuredUrl = config?.url || ''
                const enabled = config?.enabled ?? false
                const events: string[] = config?.events || []
                const hasUpsert = events.includes('MESSAGES_UPSERT')
                const urlMatch = configuredUrl === expectedWebhookUrl

                if (enabled && urlMatch && hasUpsert) {
                    diagnostics['evolution_webhook'] = {
                        status: '✅ OK',
                        detail: configuredUrl,
                    }
                } else {
                    const issues: string[] = []
                    if (!enabled) issues.push('disabled')
                    if (!urlMatch) issues.push(`url=${configuredUrl || 'empty'}`)
                    if (!hasUpsert) issues.push('missing MESSAGES_UPSERT')
                    diagnostics['evolution_webhook'] = {
                        status: '⚠️ MISCONFIGURED',
                        detail: `${issues.join(', ')} | expected: ${expectedWebhookUrl}`,
                    }
                }
            } else {
                const text = await res.text()
                diagnostics['evolution_webhook'] = {
                    status: '❌ ERROR',
                    detail: `HTTP ${res.status}: ${text.slice(0, 150)}`,
                }
            }
        } else {
            diagnostics['evolution_webhook'] = { status: '⏭️ SKIPPED', detail: 'Missing Evolution env vars' }
        }
    } catch (err) {
        diagnostics['evolution_webhook'] = {
            status: '❌ UNREACHABLE',
            detail: err instanceof Error ? err.message : String(err),
        }
    }

    // 5. Check OpenRouter API + SDR model availability
    try {
        if (process.env.OPENROUTER_API_KEY) {
            const res = await fetch('https://openrouter.ai/api/v1/models', {
                headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
                signal: AbortSignal.timeout(5000),
            })

            if (res.ok) {
                const modelsData = await res.json()
                const modelIds: string[] = (modelsData?.data || []).map(
                    (m: { id?: string }) => m.id
                )
                const sdrModel = 'google/gemini-3.1-flash-lite'
                const modelAvailable = modelIds.includes(sdrModel)
                diagnostics['openrouter_api'] = {
                    status: '✅ OK',
                    detail: 'API key valid',
                }
                diagnostics['sdr_model'] = {
                    status: modelAvailable ? '✅ OK' : '⚠️ NOT LISTED',
                    detail: sdrModel,
                }
            } else {
                diagnostics['openrouter_api'] = { status: '❌ ERROR', detail: `HTTP ${res.status}` }
                diagnostics['sdr_model'] = { status: '⏭️ SKIPPED', detail: 'OpenRouter check failed' }
            }
        } else {
            diagnostics['openrouter_api'] = { status: '⏭️ SKIPPED', detail: 'Missing API key' }
            diagnostics['sdr_model'] = { status: '⏭️ SKIPPED', detail: 'Missing API key' }
        }
    } catch (err) {
        diagnostics['openrouter_api'] = {
            status: '❌ UNREACHABLE',
            detail: err instanceof Error ? err.message : String(err),
        }
        diagnostics['sdr_model'] = {
            status: '❌ UNREACHABLE',
            detail: err instanceof Error ? err.message : String(err),
        }
    }

    // Overall status
    const allOk = Object.values(diagnostics).every(d => d.status.includes('✅'))

    return NextResponse.json({
        overall: allOk ? '✅ ALL SYSTEMS OK' : '⚠️ ISSUES FOUND',
        timestamp: new Date().toISOString(),
        checks: diagnostics,
    })
}
