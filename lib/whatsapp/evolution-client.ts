/**
 * Evolution API Client for WhatsApp
 * Documentation: https://doc.evolution-api.com/
 */

import { normalizePhone } from './client'

function getConfig() {
    const apiUrl = process.env.EVOLUTION_API_URL
    const apiKey = process.env.EVOLUTION_API_KEY
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME

    if (!apiUrl || !apiKey || !instanceName) {
        throw new Error(
            'Evolution API configuration missing: EVOLUTION_API_URL, EVOLUTION_API_KEY, and EVOLUTION_INSTANCE_NAME required'
        )
    }

    return { 
        apiUrl: apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl, 
        apiKey, 
        instanceName 
    }
}

async function callEvolutionApi<T = unknown>(
    path: string,
    options: { method?: string; body?: Record<string, unknown> } = {}
): Promise<T> {
    const { apiUrl, apiKey, instanceName } = getConfig()
    const { method = 'GET', body } = options

    const url = `${apiUrl}${path.replace('{instance}', instanceName)}`

    const response = await fetch(url, {
        method,
        headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (!response.ok) {
        const error = await response.text()
        console.error('Evolution API error:', response.status, error)
        throw new Error(`Evolution API error: ${response.status} - ${error}`)
    }

    return response.json()
}

// ==================== SEND MESSAGES ====================

/**
 * Send a text message via Evolution API
 */
export async function sendTextMessage(phone: string, message: string): Promise<any> {
    return callEvolutionApi('/message/sendText/{instance}', {
        method: 'POST',
        body: {
            number: normalizePhone(phone),
            text: message,
        },
    })
}

/**
 * Send an image message via Evolution API
 */
export async function sendMediaMessage(
    phone: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'document' | 'audio',
    caption?: string,
    fileName?: string
): Promise<any> {
    return callEvolutionApi('/message/sendMedia/{instance}', {
        method: 'POST',
        body: {
            number: normalizePhone(phone),
            mediatype: mediaType,
            caption: caption || '',
            media: mediaUrl,
            fileName: fileName || 'file',
        },
    })
}

/**
 * Mark a message as read in Evolution API
 */
export async function markAsRead(remoteJid: string): Promise<void> {
    try {
        await callEvolutionApi('/chat/markMessageAsRead/{instance}', {
            method: 'POST',
            body: {
                readMessages: [
                    {
                        remoteJid: remoteJid,
                        fromMe: false,
                        id: "" // Evolution API usually handles latest if ID is empty or not provided correctly
                    }
                ]
            },
        })
    } catch (err) {
        console.error('Failed to mark as read:', err)
    }
}

// ==================== INSTANCE INFO ====================

/**
 * Get instance connection status
 */
export async function getInstanceStatus(): Promise<any> {
    return callEvolutionApi('/instance/connectionStatus/{instance}')
}

/**
 * Test Evolution API connection
 */
export async function testConnection(): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
        const info = await getInstanceStatus()
        return {
            success: true,
            status: info.instance?.state || 'unknown',
        }
    } catch (error) {
        return { success: false, error: String(error) }
    }
}
