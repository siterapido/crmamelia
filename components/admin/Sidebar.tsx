'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { cn } from '@/lib/utils/cn'
import { canAccess, hasPermission, ROLE_LABELS, type UserRole } from '@/lib/auth/rbac'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    FolderOpen,
    LogOut,
    Users,
    Plug,
    Building2,
    MessageSquare,
} from 'lucide-react'

const adminSystemItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Usuários', icon: Users },
    { href: '/admin/connections', label: 'Conexões', icon: Plug },
    { href: '/admin/team', label: 'Equipe', icon: Building2 },
]

const crmItems = [
    { href: '/crm/dashboard', label: 'Dashboard CRM', icon: LayoutDashboard },
    { href: '/crm/contacts', label: 'Contatos', icon: Users },
    { href: '/crm/conversations', label: 'Conversas', icon: MessageSquare },
    { href: '/crm/pipeline', label: 'Pipeline', icon: FolderOpen },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const isAdminSystem =
        pathname.startsWith('/admin/users') ||
        pathname === '/admin' ||
        pathname.startsWith('/admin/connections') ||
        pathname.startsWith('/admin/team')

    const handleLogout = async () => {
        await logout()
        window.location.href = '/'
    }

    const getSectionTitle = () => (isAdminSystem ? 'Admin System' : 'Painel')

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-charcoal border-r border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="relative w-28 h-9">
                        <Image
                            src="/logo-amelia-branca.png"
                            alt="Amélia Saúde"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <p className="text-platinum text-xs">{getSectionTitle()}</p>
                </Link>
            </div>

            <nav className="flex-1 py-6 px-4 overflow-y-auto">
                {user && hasPermission(user, 'users:manage') && (
                    <>
                        <p className="text-platinum/50 text-[10px] uppercase tracking-widest font-semibold px-4 mb-2">Admin</p>
                        <ul className="space-y-1">
                            {adminSystemItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/admin' && pathname.startsWith(item.href))

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
                                                    layoutId="activeIndicator"
                                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-gold"
                                                />
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                        <div className="my-4 mx-4 border-t border-white/10" />
                    </>
                )}

                {user && canAccess(user, 'crm') && (
                    <>
                        {hasPermission(user, 'users:manage') ? (
                            <div className="my-4 mx-4 border-t border-white/10" />
                        ) : (
                            <div className="mb-4" />
                        )}
                        <p className="text-platinum/50 text-[10px] uppercase tracking-widest font-semibold px-4 mb-2">CRM</p>
                        <ul className="space-y-1">
                            {crmItems.map((item) => {
                                const isActive =
                                    pathname === item.href || pathname.startsWith(`${item.href}/`)

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
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                )}
            </nav>

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
