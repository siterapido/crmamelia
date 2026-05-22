'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { canAccessSettingsSection, type SettingsSection } from '@/lib/auth/rbac'
import { cn } from '@/lib/utils/cn'
import { User, Users, Zap, Plug } from 'lucide-react'
import { useEffect } from 'react'

const NAV: {
    href: string
    label: string
    section: SettingsSection
    icon: typeof User
}[] = [
    { href: '/crm/settings/profile', label: 'Perfil', section: 'profile', icon: User },
    { href: '/crm/settings/team', label: 'Equipe', section: 'team', icon: Users },
    { href: '/crm/settings/templates', label: 'Templates', section: 'templates', icon: Zap },
    { href: '/crm/settings/integrations', label: 'Integrações', section: 'integrations', icon: Plug },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user } = useAuth()

    const visibleNav = NAV.filter(
        (item) => user && canAccessSettingsSection(user, item.section)
    )

    useEffect(() => {
        if (!user) return
        const match = NAV.find((n) => pathname.startsWith(n.href))
        if (match && !canAccessSettingsSection(user, match.section)) {
            router.replace('/crm/settings/profile')
        }
    }, [user, pathname, router])

    return (
        <div className="flex gap-8 max-w-5xl">
            <nav className="w-48 shrink-0 space-y-1">
                <p className="text-[var(--crm-text-muted)] text-[10px] uppercase tracking-widest font-semibold px-3 mb-3">
                    Configurações
                </p>
                {visibleNav.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            pathname.startsWith(item.href)
                                ? 'bg-[var(--crm-accent-bg)] text-[var(--crm-text)]'
                                : 'text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-2)]'
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    )
}
