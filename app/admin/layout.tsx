'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth/context'
import { canAccess } from '@/lib/auth/rbac'
import { Sidebar } from '@/components/admin/Sidebar'
import { motion } from 'framer-motion'
import { Loader2, ShieldX } from 'lucide-react'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const isLoginPage = pathname === '/admin/login'

    useEffect(() => {
        if (!loading && !user && !isLoginPage) {
            router.push('/admin/login')
        }
        if (!loading && user && !isLoginPage && !canAccess(user, 'blog')) {
            router.push('/crm')
        }
    }, [user, loading, router, isLoginPage])

    if (isLoginPage) {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black-deep flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                    <p className="text-platinum">Carregando...</p>
                </motion.div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    if (!canAccess(user, 'blog')) {
        return (
            <div className="min-h-screen bg-black-deep flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <ShieldX className="w-12 h-12 text-red-400" />
                    <h2 className="text-xl font-bold text-white">Acesso Negado</h2>
                    <p className="text-platinum">Você não tem permissão para acessar esta área.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black-deep flex">
            <Sidebar />
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

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
    )
}
