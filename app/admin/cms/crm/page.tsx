'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, UserCheck, TrendingUp, LayoutGrid, Target, Sparkles, Plus } from 'lucide-react'
import Link from 'next/link'

interface CRMStats {
    totalContacts: number
    newContacts: number
    qualifiedContacts: number
    activeConversations: number
    unreadMessages: number
    wonDeals: number
    totalDeals: number
    aiInteractionsToday: number
    dealsByStage: Array<{
        stageId: string
        stageName: string
        stageSlug: string
        stageColor: string | null
        count: number
    }>
    contactsBySource: Array<{ source: string; count: number }>
}

export default function CRMDashboard() {
    const [stats, setStats] = useState<CRMStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/crm/stats')
            .then(res => res.json())
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const statCards = [
        { label: 'Novos Leads', value: stats?.newContacts ?? 0, icon: Users, color: 'gold' },
        { label: 'Conversas Ativas', value: stats?.activeConversations ?? 0, icon: MessageSquare, color: 'blue' },
        { label: 'Qualificados', value: stats?.qualifiedContacts ?? 0, icon: UserCheck, color: 'green' },
        { label: 'Deals Ganhos', value: stats?.wonDeals ?? 0, icon: Target, color: 'purple' },
    ]

    const colorClasses: Record<string, string> = {
        gold: 'bg-gold/10 text-gold border-gold/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">CRM</h1>
                    <p className="text-platinum mt-1">Gestão de leads e vendas</p>
                </div>
                <Link
                    href="/admin/cms/crm/contacts?new=true"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Novo Contato
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-charcoal rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-platinum text-sm">{stat.label}</p>
                                <p className="text-4xl font-bold text-white mt-2">
                                    {loading ? '-' : stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl border ${colorClasses[stat.color]}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-charcoal rounded-2xl p-6 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-gold" />
                            Pipeline
                        </h2>
                        <Link href="/admin/cms/crm/pipeline" className="text-gold text-sm hover:underline">
                            Ver pipeline
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse flex items-center gap-3">
                                    <div className="w-3 h-3 bg-white/10 rounded-full" />
                                    <div className="flex-1 h-4 bg-white/10 rounded" />
                                    <div className="w-8 h-4 bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : stats?.dealsByStage && stats.dealsByStage.length > 0 ? (
                        <div className="space-y-3">
                            {stats.dealsByStage.map(stage => (
                                <div key={stage.stageId} className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: stage.stageColor || '#666' }}
                                    />
                                    <span className="text-white flex-1">{stage.stageName}</span>
                                    <span className="text-platinum font-medium">{stage.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <LayoutGrid className="w-12 h-12 text-platinum/50 mx-auto mb-3" />
                            <p className="text-platinum">Nenhum deal ainda</p>
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-charcoal rounded-2xl p-6 border border-white/10"
                >
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold" />
                        Ações Rápidas
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/admin/cms/crm/conversations"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group"
                        >
                            <MessageSquare className="w-8 h-8 text-platinum group-hover:text-gold transition-colors" />
                            <span className="text-white font-medium text-center">Conversas</span>
                        </Link>

                        <Link
                            href="/admin/cms/crm/contacts"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group"
                        >
                            <UserCheck className="w-8 h-8 text-platinum group-hover:text-gold transition-colors" />
                            <span className="text-white font-medium text-center">Contatos</span>
                        </Link>

                        <Link
                            href="/admin/cms/crm/pipeline"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group"
                        >
                            <TrendingUp className="w-8 h-8 text-platinum group-hover:text-gold transition-colors" />
                            <span className="text-white font-medium text-center">Pipeline</span>
                        </Link>

                        <Link
                            href="/admin/cms/crm/settings"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group"
                        >
                            <Sparkles className="w-8 h-8 text-platinum group-hover:text-gold transition-colors" />
                            <span className="text-white font-medium text-center">Config IA</span>
                        </Link>
                    </div>

                    {stats && (
                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                            <span className="text-platinum text-sm">Interações IA hoje</span>
                            <span className="text-gold font-semibold">{stats.aiInteractionsToday}</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
