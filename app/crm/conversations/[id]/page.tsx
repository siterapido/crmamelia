'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

/**
 * Mobile fallback: redirects to inbox with conversation selected
 * On desktop, conversations are viewed in the two-panel inbox
 */
export default function ConversationDetailPage() {
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        router.replace(`/crm/conversations?active=${params.id}`)
    }, [params.id, router])

    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-platinum">Redirecionando...</div>
        </div>
    )
}
