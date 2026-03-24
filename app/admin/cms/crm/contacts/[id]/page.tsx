'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Phone, Mail, Building2, FileText, MessageSquare,
    Target, Calendar, User, Sparkles, Edit2, Save, X
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface ContactDetail {
    id: string
    name: string
    phone: string
    email: string | null
    company: string | null
    cpfCnpj: string | null
    source: string
    status: string
    notes: string | null
    whatsappId: string | null
    planInterest: string | null
    livesCount: number | null
    lastContactAt: string | null
    createdAt: string
    updatedAt: string
    assignedUser: { id: string; name: string } | null
    conversations: Array<{
        id: string
        status: string
        aiEnabled: boolean
        lastMessageAt: string | null
        messageCount: number
    }>
    deals: Array<{
        id: string
        title: string
        value: number | null
        planInterest: string | null
        stage: { id: string; name: string; slug: string; color: string | null } | null
    }>
}

const statusLabels: Record<string, string> = {
    new: 'Novo', contacted: 'Contactado', qualified: 'Qualificado',
    proposal: 'Proposta', won: 'Ganho', lost: 'Perdido',
}
const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    qualified: 'bg-gold/10 text-gold border-gold/20',
    proposal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    won: 'bg-green-500/10 text-green-400 border-green-500/20',
    lost: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function ContactDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [contact, setContact] = useState<ContactDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [editForm, setEditForm] = useState<Partial<ContactDetail>>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!params.id) return
        fetch(`/api/crm/contacts/${params.id}`)
            .then(res => {
                if (!res.ok) throw new Error('Not found')
                return res.json()
            })
            .then(data => {
                setContact(data)
                setEditForm({ name: data.name, phone: data.phone, email: data.email, company: data.company, notes: data.notes, planInterest: data.planInterest })
            })
            .catch(() => router.push('/admin/cms/crm/contacts'))
            .finally(() => setLoading(false))
    }, [params.id, router])

    const handleSave = async () => {
        if (!contact) return
        setSaving(true)
        try {
            const res = await fetch(`/api/crm/contacts/${contact.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            })
            if (res.ok) {
                const data = await res.json()
                setContact(prev => prev ? { ...prev, ...data.contact } : prev)
                setEditing(false)
            }
        } finally {
            setSaving(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!contact) return
        const res = await fetch(`/api/crm/contacts/${contact.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        })
        if (res.ok) {
            setContact(prev => prev ? { ...prev, status: newStatus } : prev)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse h-8 bg-white/10 rounded w-1/3" />
                <div className="animate-pulse h-64 bg-white/10 rounded-2xl" />
            </div>
        )
    }

    if (!contact) return null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/cms/crm/contacts"
                    className="p-2 rounded-lg bg-white/5 text-platinum hover:bg-white/10 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white">{contact.name}</h1>
                    <p className="text-platinum mt-1">{contact.phone}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[contact.status] || 'bg-white/10 text-platinum border-white/10'}`}>
                    {statusLabels[contact.status] || contact.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-charcoal rounded-2xl p-6 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-gold" />
                            Informações
                        </h2>
                        {!editing ? (
                            <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-gold text-sm hover:underline">
                                <Edit2 className="w-4 h-4" /> Editar
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-platinum text-sm hover:text-white">
                                    <X className="w-4 h-4" /> Cancelar
                                </button>
                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-gold text-sm hover:underline">
                                    <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editing ? (
                            <>
                                <div>
                                    <label className="block text-platinum text-sm mb-1">Nome</label>
                                    <input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50" />
                                </div>
                                <div>
                                    <label className="block text-platinum text-sm mb-1">Telefone</label>
                                    <input value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50" />
                                </div>
                                <div>
                                    <label className="block text-platinum text-sm mb-1">Email</label>
                                    <input value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50" />
                                </div>
                                <div>
                                    <label className="block text-platinum text-sm mb-1">Empresa</label>
                                    <input value={editForm.company || ''} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-platinum text-sm mb-1">Notas</label>
                                    <textarea value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50 resize-none" />
                                </div>
                            </>
                        ) : (
                            <>
                                <InfoField icon={Phone} label="Telefone" value={contact.phone} />
                                <InfoField icon={Mail} label="Email" value={contact.email || '-'} />
                                <InfoField icon={Building2} label="Empresa" value={contact.company || '-'} />
                                <InfoField icon={Target} label="Plano de Interesse" value={contact.planInterest || '-'} />
                                <InfoField icon={Calendar} label="Criado em" value={new Date(contact.createdAt).toLocaleDateString('pt-BR')} />
                                <InfoField icon={Calendar} label="Último Contato" value={contact.lastContactAt ? new Date(contact.lastContactAt).toLocaleDateString('pt-BR') : '-'} />
                                {contact.notes && (
                                    <div className="md:col-span-2 p-4 bg-white/5 rounded-xl">
                                        <p className="text-platinum text-sm mb-1">Notas</p>
                                        <p className="text-white">{contact.notes}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Status Changer */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-platinum text-sm mb-3">Alterar Status</p>
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                                        contact.status === key
                                            ? statusColors[key]
                                            : 'bg-white/5 text-platinum border-white/10 hover:bg-white/10'
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Conversations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-charcoal rounded-2xl p-6 border border-white/10"
                    >
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5 text-gold" />
                            Conversas ({contact.conversations.length})
                        </h3>
                        {contact.conversations.length > 0 ? (
                            <div className="space-y-3">
                                {contact.conversations.map(conv => (
                                    <Link
                                        key={conv.id}
                                        href={`/admin/crm/conversations/${conv.id}`}
                                        className="block p-3 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/20 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-white text-sm font-medium">
                                                {conv.aiEnabled && <Sparkles className="w-3 h-3 text-gold inline mr-1" />}
                                                {conv.status === 'active' ? 'Ativa' : 'Encerrada'}
                                            </span>
                                            <span className="text-platinum text-xs">{conv.messageCount} msgs</span>
                                        </div>
                                        {conv.lastMessageAt && (
                                            <p className="text-platinum text-xs mt-1">
                                                {new Date(conv.lastMessageAt).toLocaleString('pt-BR')}
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-platinum text-sm">Nenhuma conversa</p>
                        )}
                    </motion.div>

                    {/* Deals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-charcoal rounded-2xl p-6 border border-white/10"
                    >
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-gold" />
                            Deals ({contact.deals.length})
                        </h3>
                        {contact.deals.length > 0 ? (
                            <div className="space-y-3">
                                {contact.deals.map(deal => (
                                    <div key={deal.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-white text-sm font-medium">{deal.title}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {deal.stage && (
                                                <span
                                                    className="px-2 py-0.5 rounded text-[10px] font-medium text-white"
                                                    style={{ backgroundColor: deal.stage.color || '#666' }}
                                                >
                                                    {deal.stage.name}
                                                </span>
                                            )}
                                            {deal.value != null && (
                                                <span className="text-gold text-xs">
                                                    R$ {(deal.value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-platinum text-sm">Nenhum deal</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

function InfoField({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
            <Icon className="w-5 h-5 text-gold mt-0.5" />
            <div>
                <p className="text-platinum text-xs">{label}</p>
                <p className="text-white">{value}</p>
            </div>
        </div>
    )
}
