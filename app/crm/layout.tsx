'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth/context'
import { CrmSidebar } from '@/components/crm/CrmSidebar'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

function CrmLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
        }
    }, [user, loading, router, pathname])

    if (loading) {
        return (
            <div className="min-h-screen bg-black-deep flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                    <p className="text-platinum">Carregando CRM...</p>
                </motion.div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-black-deep flex">
            <CrmSidebar />
            <main className="flex-1 ml-64 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    )
}

export default function CrmLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            <CrmLayoutContent>{children}</CrmLayoutContent>
        </AuthProvider>
    )
}
