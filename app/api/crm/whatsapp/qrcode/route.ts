/**
 * WhatsApp QR Code API Route
 * GET /api/crm/whatsapp/qrcode - Get QR code or connection status
 * DELETE /api/crm/whatsapp/qrcode - Logout/disconnect
 */

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getQRCode, getInstanceStatus, logoutInstance } from '@/lib/whatsapp/evolution-client'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        try {
            const status = await getInstanceStatus()
            const state = status?.instance?.state

            if (state === 'open') {
                return NextResponse.json({
                    connected: true,
                    status: 'open',
                    phone: status?.instance?.profileName || status?.instance?.wuid?.split('@')[0] || null,
                    profilePicture: status?.instance?.profilePictureUrl || null,
                })
            }

            // Not connected — try to get QR code
            try {
                const qrData = await getQRCode()
                const qrCode = qrData?.qrcode?.base64 || qrData?.base64 || null

                return NextResponse.json({
                    connected: false,
                    status: state || 'close',
                    qrCode,
                })
            } catch {
                return NextResponse.json({
                    connected: false,
                    status: state || 'close',
                    qrCode: null,
                })
            }
        } catch (error) {
            return NextResponse.json({
                connected: false,
                status: 'error',
                error: String(error),
                qrCode: null,
            })
        }
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function DELETE() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        await logoutInstance()
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
