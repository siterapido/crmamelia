'use client'

import { motion } from 'framer-motion'
import { Users, Plug, Settings, Building2, ArrowRight, FolderOpen, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import { canAccess, hasPermission } from '@/lib/auth/rbac'

const adminSections = [
    {
        title: 'Usuários',
        description: 'Gerencie usuários e permissões do sistema',
        href: '/admin/users',
        icon: Users,
        color: 'gold',
    },
    {
        title: 'Conexões',
        description: 'Configure integrações e APIs externas',
        href: '/admin/connections',
        icon: Plug,
        color: 'green',
    },
    {
        title: 'Equipe',
        description: 'Gerencie hierarquia e membros da equipe',
        href: '/admin/team',
        icon: Building2,
        color: 'purple',
    },
    {
        title: 'CRM · Pipeline',
        description: 'Funil de vendas e negócios',
        href: '/crm/pipeline',
        icon: FolderOpen,
        color: 'orange',
    },
    {
        title: 'Configurações CRM',
        description: 'Preferências da área comercial',
        href: '/crm/settings',
        icon: Settings,
        color: 'gray',
    },
]

const colorMap: Record<string, string> = {
    gold: 'bg-gold/10 text-gold border-gold/20 hover:border-gold/40',
    green: 'bg-green-500/10 text-green-400 border-green-500/20 hover:border-green-500/40',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/40',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:border-orange-500/40',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:border-gray-500/40',
}

export default function AdminDashboard() {
    const { user, loading } = useAuth()

    if (loading || !user) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
        )
    }

    const visibleSections = adminSections.filter((section) => {
        const isAdminModules = ['/admin/users', '/admin/connections', '/admin/team'].includes(section.href)
        if (isAdminModules && !hasPermission(user, 'users:manage')) return false
        if (section.href.startsWith('/crm') && !canAccess(user, 'crm')) return false
        return true
    })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
                <p className="text-platinum mt-1">Gerencie o sistema Amélia Saúde</p>
            </div>

            {visibleSections.length === 0 ? (
                <p className="text-platinum rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm leading-relaxed">
                    Não há módulos disponíveis para o seu perfil no momento (CMS desativado). Se precisar de
                    acesso ao conteúdo ou ao CRM, fale com um administrador.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {visibleSections.map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={section.href}
                                className={`block rounded-2xl border p-6 transition-all ${colorMap[section.color]}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`rounded-xl bg-white/5 p-3`}>
                                        <section.icon className="h-6 w-6" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-platinum" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-white">{section.title}</h3>
                                <p className="mt-1 text-sm text-platinum">{section.description}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
