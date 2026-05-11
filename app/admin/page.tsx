'use client'

import { motion } from 'framer-motion'
import { Users, Plug, Settings, FileText, MessageSquare, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
        title: 'CMS',
        description: 'Gerencie conteúdo do blog e notícias',
        href: '/admin/cms',
        icon: FileText,
        color: 'blue',
    },
    {
        title: 'CRM',
        description: 'Acesse o gerenciamento de clientes',
        href: '/admin/cms/crm',
        icon: MessageSquare,
        color: 'orange',
    },
    {
        title: 'Configurações',
        description: 'Ajustes gerais do sistema',
        href: '/admin/cms',
        icon: Settings,
        color: 'gray',
    },
]

const colorMap: Record<string, string> = {
    gold: 'bg-gold/10 text-gold border-gold/20 hover:border-gold/40',
    green: 'bg-green-500/10 text-green-400 border-green-500/20 hover:border-green-500/40',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/40',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/40',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:border-orange-500/40',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:border-gray-500/40',
}

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
                <p className="text-platinum mt-1">Gerencie o sistema Amélia Saúde</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminSections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            href={section.href}
                            className={`block p-6 rounded-2xl border transition-all ${colorMap[section.color]}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-xl bg-white/5`}>
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-platinum" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mt-4">{section.title}</h3>
                            <p className="text-sm text-platinum mt-1">{section.description}</p>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
