'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { cn } from '@/lib/utils/cn'
import { ROLE_LABELS, type UserRole } from '@/lib/auth/rbac'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    MessageSquare,
    UserCheck,
    LayoutGrid,
    Settings,
    LogOut,
} from 'lucide-react'

const navItems = [
    { href: '/crm/dashboard', label: 'Início', icon: LayoutDashboard },
    { href: '/crm/pipeline', label: 'Pipeline', icon: LayoutGrid },
    { href: '/crm/conversations', label: 'Conversas', icon: MessageSquare },
    { href: '/crm/contacts', label: 'Contatos', icon: UserCheck },
    { href: '/crm/settings/profile', label: 'Configurações', icon: Settings },
]

export function CrmSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        window.location.href = '/admin/login'
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--crm-surface)] border-r border-[var(--crm-border)] flex flex-col">
            <div className="p-6 border-b border-[var(--crm-border)]">
                <Link href="/crm/dashboard" className="flex items-center gap-3">
                    <div className="relative w-28 h-9">
                        <Image
                            src="/logo-amelia.png"
                            alt="Amélia Saúde"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="text-[var(--crm-accent)] text-xs font-semibold">CRM</p>
                </Link>
            </div>

            <nav className="flex-1 py-6 px-4 overflow-y-auto">
                <p className="text-[var(--crm-text-muted)] text-[10px] uppercase tracking-widest font-semibold px-4 mb-2">
                    Vendas
                </p>
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.href.startsWith('/crm/settings')
                            ? pathname.startsWith('/crm/settings')
                            : pathname.startsWith(item.href)

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                        'hover:bg-[var(--crm-surface-2)]',
                                        isActive
                                            ? 'bg-[var(--crm-accent-bg)] text-[var(--crm-accent)] border border-[var(--crm-border)]'
                                            : 'text-[var(--crm-text-muted)]'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeCrmIndicator"
                                            className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--crm-accent)]"
                                        />
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-[var(--crm-border)]">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--crm-surface-2)] mb-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--crm-accent-bg)] flex items-center justify-center">
                        <span className="text-[var(--crm-accent)] font-medium">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[var(--crm-text)] text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-[var(--crm-accent)] text-[10px] uppercase tracking-wider font-semibold">
                            {ROLE_LABELS[user?.role as UserRole] || user?.role}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/15 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sair</span>
                </button>
            </div>
        </aside>
    )
}
