/**
 * Meta WhatsApp Cloud API Type Definitions
 * https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
 */

// ==================== WEBHOOK PAYLOADS ====================

export interface MetaWebhookPayload {
    object: 'whatsapp_business_account'
    entry: MetaWebhookEntry[]
}

export interface MetaWebhookEntry {
    id: string // WABA ID
    changes: MetaWebhookChange[]
}

export interface MetaWebhookChange {
    field: 'messages'
    value: MetaWebhookValue
}

export interface MetaWebhookValue {
    messaging_product: 'whatsapp'
    metadata: {
        display_phone_number: string
        phone_number_id: string
    }
    contacts?: MetaWebhookContact[]
    messages?: MetaWebhookMessage[]
    statuses?: MetaWebhookStatus[]
    errors?: MetaWebhookError[]
}

export interface MetaWebhookContact {
    profile: { name: string }
    wa_id: string
}

export interface MetaWebhookMessage {
    from: string // sender phone (e.g. "5511999999999")
    id: string   // wamid.xxx
    timestamp: string
    type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contacts' | 'sticker' | 'interactive' | 'order' | 'system' | 'unknown'
    text?: { body: string }
    image?: { id: string; mime_type: string; sha256: string; caption?: string }
    document?: { id: string; filename: string; mime_type: string; sha256: string; caption?: string }
    audio?: { id: string; mime_type: string; voice?: boolean }
    video?: { id: string; mime_type: string; sha256: string; caption?: string }
    location?: { latitude: number; longitude: number; name?: string; address?: string }
    contacts?: Array<{ name: { formatted_name: string }; phones?: Array<{ phone: string }> }>
    sticker?: { id: string; mime_type: string; animated?: boolean }
    interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } }
    context?: { forwarded?: boolean; from?: string; id?: string }
}

export interface MetaWebhookStatus {
    id: string // message wamid
    status: 'sent' | 'delivered' | 'read' | 'failed'
    timestamp: string
    recipient_id: string
    errors?: MetaWebhookError[]
}

export interface MetaWebhookError {
    code: number
    title: string
    message?: string
    error_data?: { details: string }
}

// ==================== API RESPONSES ====================

export interface MetaSendResponse {
    messaging_product: 'whatsapp'
    contacts: Array<{ input: string; wa_id: string }>
    messages: Array<{ id: string }>
}

export interface MetaPhoneNumberInfo {
    id: string
    display_phone_number: string
    verified_name: string
    quality_rating?: string
}
