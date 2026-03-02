/**
 * Meta WhatsApp Cloud API Client
 * Official API: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

import type { MetaSendResponse, MetaPhoneNumberInfo } from './types'

const GRAPH_API_VERSION = 'v20.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

function getConfig() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!phoneNumberId || !accessToken) {
        throw new Error(
            'WhatsApp configuration missing: WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN required'
        )
    }

    return { phoneNumberId, accessToken }
}

async function callMetaApi<T = unknown>(
    path: string,
    options: { method?: string; body?: Record<string, unknown> } = {}
): Promise<T> {
    const { phoneNumberId, accessToken } = getConfig()
    const { method = 'GET', body } = options

    const url = path.startsWith('http') ? path : `${GRAPH_API_BASE}/${phoneNumberId}${path}`

    const response = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (!response.ok) {
        const error = await response.text()
        console.error('Meta API error:', response.status, error)
        throw new Error(`Meta API error: ${response.status} - ${error}`)
    }

    return response.json()
}

// ==================== SEND MESSAGES ====================

/**
 * Send a text message via WhatsApp Cloud API
 */
export async function sendTextMessage(phone: string, message: string): Promise<MetaSendResponse> {
    return callMetaApi<MetaSendResponse>('/messages', {
        method: 'POST',
        body: {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: normalizePhone(phone),
            type: 'text',
            text: { preview_url: false, body: message },
        },
    })
}

/**
 * Send an image message via WhatsApp Cloud API
 */
export async function sendImageMessage(
    phone: string,
    imageUrl: string,
    caption?: string
): Promise<MetaSendResponse> {
    return callMetaApi<MetaSendResponse>('/messages', {
        method: 'POST',
        body: {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: normalizePhone(phone),
            type: 'image',
            image: { link: imageUrl, ...(caption ? { caption } : {}) },
        },
    })
}

/**
 * Send a document message via WhatsApp Cloud API
 */
export async function sendDocumentMessage(
    phone: string,
    documentUrl: string,
    fileName: string
): Promise<MetaSendResponse> {
    return callMetaApi<MetaSendResponse>('/messages', {
        method: 'POST',
        body: {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: normalizePhone(phone),
            type: 'document',
            document: { link: documentUrl, filename: fileName },
        },
    })
}

// ==================== MESSAGE ACTIONS ====================

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
    await callMetaApi('/messages', {
        method: 'POST',
        body: {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        },
    })
}

// ==================== CONNECTION STATUS ====================

/**
 * Get phone number info (tests API connectivity)
 */
export async function getPhoneInfo(): Promise<MetaPhoneNumberInfo> {
    const { phoneNumberId, accessToken } = getConfig()
    const url = `${GRAPH_API_BASE}/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Meta API error: ${response.status} - ${error}`)
    }
    return response.json()
}

/**
 * Test Meta WhatsApp Cloud API connection
 */
export async function testConnection(): Promise<{ success: boolean; phoneNumber?: string; error?: string }> {
    try {
        const info = await getPhoneInfo()
        return {
            success: true,
            phoneNumber: info.display_phone_number,
        }
    } catch (error) {
        return { success: false, error: String(error) }
    }
}

// ==================== HELPERS ====================

/**
 * Normalize phone number to WhatsApp format (digits only, with country code)
 * Examples: "+55 (11) 99999-9999" → "5511999999999"
 */
export function normalizePhone(phone: string): string {
    let normalized = phone.replace(/\D/g, '')

    // If it doesn't start with country code (55 for Brazil), prepend it
    if (normalized.length <= 11) {
        normalized = `55${normalized}`
    }

    return normalized
}
