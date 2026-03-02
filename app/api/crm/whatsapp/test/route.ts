/**
 * WhatsApp Connection Test API Route
 * POST /api/crm/whatsapp/test - Test Meta Cloud API connection
 * GET  /api/crm/whatsapp/test - Get connection status
 */

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { testConnection, getPhoneInfo } from '@/lib/whatsapp/client'

export async function POST() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const result = await testConnection()
        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error),
        })
    }
}

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        try {
            const info = await getPhoneInfo()
            return NextResponse.json({
                connected: true,
                phoneNumber: info.display_phone_number,
                verifiedName: info.verified_name,
                qualityRating: info.quality_rating,
            })
        } catch (error) {
            return NextResponse.json({
                connected: false,
                error: String(error),
            })
        }
    } catch (error) {
        return NextResponse.json({
            connected: false,
            error: String(error),
        })
    }
}
