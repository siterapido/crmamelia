'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { cn } from '@/lib/utils/cn'
import { canAccess, isAdmin, ROLE_LABELS, type UserRole } from '@/lib/auth/rbac'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    MessageSquare,
    UserCheck,
    LayoutGrid,
    Settings,
    LogOut,
    ArrowLeft,
    Users,
    Zap,
} from 'lucide-react'

const navItems = [
    { href: '/crm/pipeline', label: 'Pipeline', icon: LayoutGrid },
    { href: '/crm/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/crm/conversations', label: 'Conversas', icon: MessageSquare },
    { href: '/crm/contacts', label: 'Contatos', icon: UserCheck },
    { href: '/crm/settings', label: 'Configurações', icon: Settings, exact: true },
]

const adminNavItems = [
    { href: '/crm/settings/users', label: 'Atendentes', icon: Users },
    { href: '/crm/settings/templates', label: 'Templates', icon: Zap },
]

export function CrmSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        window.location.href = '/admin/login'
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-charcoal border-r border-white/10 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <Link href="/crm/pipeline" className="flex items-center gap-3">
                    <div className="relative w-28 h-9">
                        <Image
                            src="/Logos/SIX SAÚDE LOGO FINAL - Branca.png"
                            alt="SIX Saude"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="text-gold text-xs font-semibold">CRM</p>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 overflow-y-auto">
                <p className="text-platinum/50 text-[10px] uppercase tracking-widest font-semibold px-4 mb-2">
                    Vendas
                </p>
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href)

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                        'hover:bg-white/5',
                                        isActive
                                            ? 'bg-gold/10 text-gold border border-gold/20'
                                            : 'text-platinum'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeCrmIndicator"
                                            className="ml-auto w-1.5 h-1.5 rounded-full bg-gold"
                                        />
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                {/* Admin Items */}
                {user && canAccess(user, 'settings') && (
                    <>
                        <div className="my-4 mx-4 border-t border-white/10" />
                        <p className="text-platinum/50 text-[10px] uppercase tracking-widest font-semibold px-4 mb-2">
                            Administração
                        </p>
                        <ul className="space-y-1">
                            {adminNavItems.map((item) => {
                                const isActive = pathname.startsWith(item.href)
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                                'hover:bg-white/5',
                                                isActive
                                                    ? 'bg-gold/10 text-gold border border-gold/20'
                                                    : 'text-platinum'
                                            )}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeCrmIndicator"
                                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-gold"
                                                />
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                )}

                {/* Back to Admin - only for admin */}
                {user && isAdmin(user) && (
                    <>
                        <div className="my-4 mx-4 border-t border-white/10" />
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-platinum hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Voltar ao Admin</span>
                        </Link>
                    </>
                )}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                        <span className="text-gold font-medium">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-gold/70 text-[10px] uppercase tracking-wider font-semibold">
                            {ROLE_LABELS[user?.role as UserRole] || user?.role}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sair</span>
                </button>
            </div>
        </aside>
    )
}
