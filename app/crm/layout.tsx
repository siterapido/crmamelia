'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth/context'
import { canAccess } from '@/lib/auth/rbac'
import { CrmSidebar } from '@/components/crm/CrmSidebar'
import { motion } from 'framer-motion'
import { Loader2, ShieldX } from 'lucide-react'

function CrmLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        }
        if (!loading && user && !canAccess(user, 'crm')) {
            router.push('/admin')
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

    if (!canAccess(user, 'crm')) {
        return (
            <div className="min-h-screen bg-black-deep flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <ShieldX className="w-12 h-12 text-red-400" />
                    <h2 className="text-xl font-bold text-white">Acesso Negado</h2>
                    <p className="text-platinum">Você não tem permissão para acessar o CRM.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-black-deep flex overflow-hidden">
            <CrmSidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto flex flex-col">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 min-h-0"
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
