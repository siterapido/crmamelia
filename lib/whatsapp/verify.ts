/**
 * Meta WhatsApp Webhook Verification
 * Validates webhook payloads using HMAC-SHA256 signature
 * https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#webhook-security
 */

import { createHmac } from 'crypto'

/**
 * Verify the webhook GET request from Meta (challenge verification)
 */
export function verifyWebhookChallenge(
    mode: string | null,
    verifyToken: string | null,
    challenge: string | null
): string | null {
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN
    if (!expectedToken) {
        console.warn('WHATSAPP_VERIFY_TOKEN not set')
        return null
    }

    if (mode === 'subscribe' && verifyToken === expectedToken && challenge) {
        return challenge
    }

    return null
}

/**
 * Verify the webhook POST signature from Meta
 * Uses X-Hub-Signature-256 header with HMAC-SHA256(appSecret, rawBody)
 */
export function verifyWebhookSignature(
    rawBody: string,
    signature: string | null
): boolean {
    const appSecret = process.env.WHATSAPP_APP_SECRET
    if (!appSecret) {
        console.warn('WHATSAPP_APP_SECRET not set — skipping signature verification')
        return true // Allow if not configured (development only)
    }

    if (!signature) {
        console.error('Missing X-Hub-Signature-256 header')
        return false
    }

    const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`
    return signature === expected
}
