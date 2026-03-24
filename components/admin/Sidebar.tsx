'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { cn } from '@/lib/utils/cn'
import { canAccess, hasPermission, isAdmin, ROLE_LABELS, type UserRole } from '@/lib/auth/rbac'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Sparkles,
    Settings,
    LogOut,
    PenSquare,
    ArrowRight,
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

const cmsItems = [
    { href: '/admin/cms', label: 'Dashboard CMS', icon: LayoutDashboard },
    { href: '/admin/cms/posts', label: 'Posts', icon: FileText },
    { href: '/admin/cms/posts/new', label: 'Novo Post', icon: PenSquare },
    { href: '/admin/cms/ai-generator', label: 'Gerador IA', icon: Sparkles },
]

const crmItems = [
    { href: '/admin/cms/crm', label: 'Dashboard CRM', icon: LayoutDashboard },
    { href: '/admin/cms/crm/contacts', label: 'Contatos', icon: Users },
    { href: '/admin/cms/crm/conversations', label: 'Conversas', icon: MessageSquare },
    { href: '/admin/cms/crm/pipeline', label: 'Pipeline', icon: FolderOpen },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const isAdminSystem = pathname.startsWith('/admin/users') || 
                          pathname === '/admin' || 
                          pathname.startsWith('/admin/connections') ||
                          pathname.startsWith('/admin/team')
    
    const isCMS = pathname.startsWith('/admin/cms')

    const handleLogout = async () => {
        await logout()
        window.location.href = '/login'
    }

    const getSectionTitle = () => {
        if (isAdminSystem) return 'Admin System'
        if (isCMS) return 'CMS'
        return 'Painel'
    }

    const getItems = () => {
        if (isAdminSystem) return adminSystemItems
        if (isCMS) {
            const items = [...cmsItems]
            if (user && canAccess(user, 'crm')) {
                items.push({ href: '/admin/cms/crm', label: 'CRM', icon: MessageSquare } as any)
            }
            return items
        }
        return adminSystemItems
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-charcoal border-r border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="relative w-28 h-9">
                        <Image
                            src="/Logos/SIX SAÚDE LOGO FINAL - Branca.png"
                            alt="SIX Saúde"
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

                {user && isAdmin(user) && (
                    <>
                        <p className="text-platinum/50 text-[10px] uppercase tracking-widest font-semibold px-4 mb-2">CMS</p>
                        <ul className="space-y-1">
                            {cmsItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/admin/cms' && pathname.startsWith(item.href))

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
                    </>
                )}

                {user && canAccess(user, 'crm') && (
                    <>
                        <div className="my-4 mx-4 border-t border-white/10" />
                        <p className="text-platinum/50 text-[10px] uppercase tracking-widest font-semibold px-4 mb-2">CRM</p>
                        <ul className="space-y-1">
                            {crmItems.slice(1).map((item) => {
                                const isActive = pathname === item.href ||
                                    pathname.startsWith(item.href + '/')

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

                {user && canAccess(user, 'crm') && (
                    <>
                        <div className="my-4 mx-4 border-t border-white/10" />
                        <Link
                            href="/crm"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gold bg-gold/5 border border-gold/10 hover:bg-gold/10 transition-all duration-200"
                        >
                            <ArrowRight className="w-5 h-5" />
                            <span className="font-medium">Área CRM Exclusiva</span>
                        </Link>
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
