'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, MessageSquare, LayoutGrid, Loader2, Clock, User } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { canViewAllCRMData } from '@/lib/auth/rbac'
import { cn } from '@/lib/utils/cn'
import { hoursSince, formatInactivityDuration, getInactivityLevel, INACTIVITY_LABELS } from '@/lib/crm/inactivity'

interface InboxFollowup {
    id: string
    scheduledAt: string
    message: string
    contact: { id: string; name: string; phone: string } | null
    assignedUser: { id: string; name: string } | null
}

interface InboxConversation {
    id: string
    lastInboundAt: string | null
    contact: { id: string; name: string; phone: string } | null
    assignedUser: { id: string; name: string } | null
}

interface InboxDeal {
    id: string
    title: string
    lastInboundAt: string | null
    contact: { id: string; name: string; phone: string } | null
    stage: { name: string; color: string | null } | null
    assignedUser: { id: string; name: string } | null
}

interface Assignee {
    id: string
    name: string
    role: string
}

function greeting(): string {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
}

function InactivityBadge({ lastInboundAt }: { lastInboundAt: string | null }) {
    const hours = hoursSince(lastInboundAt)
    const level = getInactivityLevel(hours)
    if (!level || hours === null) return null
    return (
        <span className={cn(
            'text-[10px] font-medium px-1.5 py-0.5 rounded border',
            level === 'alert' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            level === 'critical' && 'bg-orange-500/10 text-orange-600 border-orange-500/20',
            level === 'dormant' && 'bg-red-500/10 text-red-600 border-red-500/20',
        )}>
            {INACTIVITY_LABELS[level]} · {formatInactivityDuration(hours)}
        </span>
    )
}

export default function CRMDashboard() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [assigneeId, setAssigneeId] = useState('all')
    const [followups, setFollowups] = useState<InboxFollowup[]>([])
    const [conversations, setConversations] = useState<InboxConversation[]>([])
    const [deals, setDeals] = useState<InboxDeal[]>([])
    const [assignees, setAssignees] = useState<Assignee[]>([])

    const viewAll = user ? canViewAllCRMData(user) : false

    const loadInbox = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (viewAll && assigneeId !== 'all') params.set('assigneeId', assigneeId)
            const res = await fetch(`/api/crm/inbox?${params}`, { credentials: 'include' })
            const data = await res.json()
            setFollowups(data.followups || [])
            setConversations(data.conversations || [])
            setDeals(data.deals || [])
            if (data.assignees) setAssignees(data.assignees)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [assigneeId, viewAll])

    useEffect(() => {
        if (user) loadInbox()
    }, [user, loadInbox])

    const columns = [
        {
            title: 'Follow-ups atrasados',
            icon: Bell,
            count: followups.length,
            empty: 'Nenhum follow-up atrasado',
            items: followups.map(f => ({
                key: f.id,
                href: f.contact ? `/crm/contacts/${f.contact.id}` : '/crm/conversations',
                name: f.contact?.name || 'Contato',
                sub: f.message,
                meta: new Date(f.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                assignee: f.assignedUser?.name,
            })),
        },
        {
            title: 'Conversas inativas',
            icon: MessageSquare,
            count: conversations.length,
            empty: 'Nenhuma conversa inativa',
            items: conversations.map(c => ({
                key: c.id,
                href: `/crm/conversations/${c.id}`,
                name: c.contact?.name || 'Contato',
                sub: c.contact?.phone,
                badge: <InactivityBadge lastInboundAt={c.lastInboundAt} />,
                assignee: c.assignedUser?.name,
            })),
        },
        {
            title: 'Deals parados',
            icon: LayoutGrid,
            count: deals.length,
            empty: 'Nenhum deal parado',
            items: deals.map(d => ({
                key: d.id,
                href: `/crm/pipeline`,
                name: d.title,
                sub: d.stage?.name,
                badge: <InactivityBadge lastInboundAt={d.lastInboundAt} />,
                assignee: d.assignedUser?.name,
            })),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--crm-text)]">
                        {greeting()}, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-[var(--crm-text-muted)] text-sm mt-0.5">Sua caixa de entrada de vendas</p>
                </div>

                {viewAll && (
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--crm-text-muted)]" />
                        <select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="px-3 py-2 bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-xl text-sm text-[var(--crm-text)] focus:outline-none focus:border-[var(--crm-accent)]"
                        >
                            <option value="all">Todos os responsáveis</option>
                            {assignees.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 text-[var(--crm-accent)] animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {columns.map((col, colIndex) => (
                        <motion.div
                            key={col.title}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: colIndex * 0.05 }}
                            className="bg-[var(--crm-surface)] rounded-2xl border border-[var(--crm-border)] flex flex-col min-h-[320px]"
                        >
                            <div className="px-5 py-4 border-b border-[var(--crm-border)] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <col.icon className="w-4 h-4 text-[var(--crm-accent)]" />
                                    <h2 className="font-semibold text-[var(--crm-text)] text-sm">{col.title}</h2>
                                </div>
                                <span className="text-xs font-medium text-[var(--crm-text-muted)] bg-[var(--crm-surface-2)] px-2 py-0.5 rounded-full">
                                    {col.count}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {col.items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Clock className="w-10 h-10 text-[var(--crm-text-muted)]/40 mb-2" />
                                        <p className="text-[var(--crm-text-muted)] text-sm">{col.empty}</p>
                                    </div>
                                ) : (
                                    col.items.map(item => (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className="block p-3 rounded-xl bg-[var(--crm-surface-2)] border border-[var(--crm-border)] hover:border-[var(--crm-accent)]/30 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-[var(--crm-text)] text-sm font-medium truncate">{item.name}</p>
                                                {'badge' in item && item.badge}
                                            </div>
                                            {item.sub && (
                                                <p className="text-[var(--crm-text-muted)] text-xs mt-0.5 truncate">{item.sub}</p>
                                            )}
                                            {'meta' in item && item.meta && (
                                                <p className="text-[var(--crm-accent)] text-xs mt-1">{item.meta}</p>
                                            )}
                                            {viewAll && item.assignee && (
                                                <p className="text-[var(--crm-text-muted)] text-[10px] mt-1">{item.assignee}</p>
                                            )}
                                        </Link>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
