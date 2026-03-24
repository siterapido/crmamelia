'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Building2, ChevronLeft, ChevronRight, DollarSign, X, Phone, Mail, Users, Tag, FileText, ExternalLink, Calendar, Layers, Star, Pencil, Check, AlertCircle, Loader2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'
import Link from 'next/link'

interface PipelineStage {
    id: string
    name: string
    slug: string
    color: string | null
    order: number
}

interface Deal {
    id: string
    title: string
    value: number | null
    planInterest: string | null
    livesCount: number | null
    createdAt: string
    contact: {
        id: string
        name: string
        phone: string
        company: string | null
        profilePictureUrl: string | null
        leadScore: number | null
    } | null
    stage: { id: string; name: string; slug: string; color: string | null; order: number } | null
    assignedUser: { id: string; name: string } | null
}

interface ContactDetail {
    id: string
    name: string
    phone: string
    email: string | null
    company: string | null
    source: string
    status: string
    planInterest: string | null
    livesCount: number | null
    leadScore: number | null
    notes: string | null
    cpfCnpj: string | null
    lastContactAt: string | null
    createdAt: string
    tags: string[]
    assignedUser: { id: string; name: string } | null
}

const statusLabels: Record<string, string> = {
    new: 'Novo', contacted: 'Contactado', qualified: 'Qualificado',
    proposal: 'Proposta', won: 'Ganho', lost: 'Perdido',
}
const statusColors: Record<string, string> = {
    new: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    contacted: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    qualified: 'bg-gold/15 text-gold border-gold/20',
    proposal: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    won: 'bg-green-500/15 text-green-400 border-green-500/20',
    lost: 'bg-red-500/15 text-red-400 border-red-500/20',
}
const sourceLabels: Record<string, string> = {
    whatsapp: 'WhatsApp', website: 'Website', manual: 'Manual',
}

const pipelineScoreColors: Record<number, string> = {
    1: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    2: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    3: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    4: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    5: 'text-red-400 bg-red-500/10 border-red-500/20',
}

function PipelineLeadScore({ score }: { score: number }) {
    return (
        <span className={cn(
            'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border',
            pipelineScoreColors[score] || pipelineScoreColors[1]
        )}>
            <Star className="w-2.5 h-2.5" fill="currentColor" />
            {score}
        </span>
    )
}

type ModalTab = 'overview' | 'contact' | 'deal' | 'conversation'

const TABS: { id: ModalTab; label: string }[] = [
    { id: 'conversation', label: 'Conversa' },
    { id: 'overview', label: 'Visão Geral' },
    { id: 'contact', label: 'Contato' },
    { id: 'deal', label: 'Negócio' },
]

interface Message {
    id: string
    content: string
    messageType: string
    direction: string
    createdAt: string
    mediaUrl?: string | null
    fileName?: string | null
}

function FieldInput({ label, value, onChange, type = 'text', placeholder }: {
    label: string; value: string; onChange: (v: string) => void
    type?: string; placeholder?: string
}) {
    return (
        <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-platinum/50 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-platinum/30 focus:outline-none focus:border-gold/50 focus:bg-white/8 transition-all"
            />
        </div>
    )
}

function FieldSelect({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void
    options: { value: string; label: string }[]
}) {
    return (
        <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-platinum/50 mb-1">{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 transition-all appearance-none"
            >
                {options.map(o => <option key={o.value} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>)}
            </select>
        </div>
    )
}

function FieldTextarea({ label, value, onChange, placeholder }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
    return (
        <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-platinum/50 mb-1">{label}</label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-platinum/30 focus:outline-none focus:border-gold/50 focus:bg-white/8 transition-all resize-none"
            />
        </div>
    )
}

function DealDetailModal({ deal, stages, onClose, onUpdated }: {
    deal: Deal; stages: PipelineStage[]; onClose: () => void; onUpdated: () => void
}) {
    const [contact, setContact] = useState<ContactDetail | null>(null)
    const [loadingContact, setLoadingContact] = useState(false)
    const [tab, setTab] = useState<ModalTab>('conversation')
    const [editingContact, setEditingContact] = useState(false)
    const [editingDeal, setEditingDeal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    // Conversation
    const [convId, setConvId] = useState<string | null>(null)
    const [msgs, setMsgs] = useState<Message[]>([])
    const [loadingMsgs, setLoadingMsgs] = useState(false)
    const [msgText, setMsgText] = useState('')
    const [sendingMsg, setSendingMsg] = useState(false)
    const msgsEndRef = useRef<HTMLDivElement>(null)

    // Contact form state
    const [cForm, setCForm] = useState({ name: '', phone: '', email: '', company: '', cpfCnpj: '', status: '', source: '', planInterest: '', livesCount: '', leadScore: '', notes: '' })
    // Deal form state
    const [dForm, setDForm] = useState({ title: '', value: '', planInterest: '', livesCount: '', stageId: '', notes: '', expectedCloseDate: '' })

    const loadContact = useCallback(() => {
        if (!deal.contact?.id) return
        setLoadingContact(true)
        Promise.all([
            fetch(`/api/crm/contacts/${deal.contact.id}`).then(r => r.json()),
            fetch(`/api/crm/contacts/${deal.contact.id}/tags`).then(r => r.json()),
        ])
            .then(([cd, td]) => {
                if (!cd.error) {
                    const tags = (td.data || []).map((t: { tag: string }) => t.tag)
                    const c = { ...cd, tags }
                    setContact(c)
                    setCForm({
                        name: c.name || '', phone: c.phone || '', email: c.email || '',
                        company: c.company || '', cpfCnpj: c.cpfCnpj || '',
                        status: c.status || 'new', source: c.source || 'manual',
                        planInterest: c.planInterest || '', livesCount: c.livesCount ? String(c.livesCount) : '',
                        leadScore: c.leadScore ? String(c.leadScore) : '', notes: c.notes || '',
                    })
                }
            })
            .catch(() => null)
            .finally(() => setLoadingContact(false))
    }, [deal.contact?.id])

    useEffect(() => {
        loadContact()
        setDForm({
            title: deal.title || '', value: deal.value != null ? String(deal.value / 100) : '',
            planInterest: deal.planInterest || '', livesCount: deal.livesCount ? String(deal.livesCount) : '',
            stageId: deal.stage?.id || '', notes: '', expectedCloseDate: '',
        })
    }, [deal, loadContact])

    const loadConversation = useCallback(async () => {
        if (!deal.contact?.id) return
        setLoadingMsgs(true)
        try {
            const res = await fetch(`/api/crm/conversations?limit=1&contact=${deal.contact.id}`)
            const data = await res.json()
            const conv = data.data?.[0]
            if (!conv) { setLoadingMsgs(false); return }
            setConvId(conv.id)
            const msgRes = await fetch(`/api/crm/conversations/${conv.id}/messages?limit=50`)
            const msgData = await msgRes.json()
            setMsgs(msgData.data || [])
        } catch { /* ignore */ } finally {
            setLoadingMsgs(false)
        }
    }, [deal.contact?.id])

    useEffect(() => {
        loadConversation()
    }, [loadConversation])

    useEffect(() => {
        if (tab === 'conversation') {
            msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [msgs, tab])

    const sendMessage = async () => {
        if (!convId || !msgText.trim() || sendingMsg) return
        const text = msgText.trim()
        setSendingMsg(true)
        setMsgText('')
        try {
            const res = await fetch(`/api/crm/conversations/${convId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text, messageType: 'text' }),
            })
            const data = await res.json()
            if (res.ok) {
                setMsgs(prev => [...prev, data.message || { id: Date.now().toString(), content: text, messageType: 'text', direction: 'outbound', createdAt: new Date().toISOString() }])
            }
        } catch { /* ignore */ } finally {
            setSendingMsg(false)
        }
    }

    const saveContact = async () => {
        if (!deal.contact?.id) return
        setSaving(true); setSaveError(null)
        try {
            const body: Record<string, unknown> = {
                name: cForm.name, phone: cForm.phone, email: cForm.email || null,
                company: cForm.company || null, cpfCnpj: cForm.cpfCnpj || null,
                status: cForm.status, source: cForm.source,
                planInterest: cForm.planInterest || null,
                livesCount: cForm.livesCount ? parseInt(cForm.livesCount) : null,
                leadScore: cForm.leadScore ? parseInt(cForm.leadScore) : null,
                notes: cForm.notes || null,
            }
            const res = await fetch(`/api/crm/contacts/${deal.contact.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erro ao salvar')
            setEditingContact(false)
            loadContact()
            onUpdated()
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    const saveDeal = async () => {
        setSaving(true); setSaveError(null)
        try {
            const body: Record<string, unknown> = {
                title: dForm.title,
                value: dForm.value ? Math.round(parseFloat(dForm.value) * 100) : null,
                planInterest: dForm.planInterest || null,
                livesCount: dForm.livesCount ? parseInt(dForm.livesCount) : null,
                stageId: dForm.stageId || undefined,
                notes: dForm.notes || null,
                expectedCloseDate: dForm.expectedCloseDate ? new Date(dForm.expectedCloseDate).toISOString() : null,
            }
            const res = await fetch(`/api/crm/deals/${deal.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erro ao salvar')
            setEditingDeal(false)
            onUpdated()
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    const stageColor = deal.stage?.color || '#666666'

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-[#161616] rounded-2xl border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]"
            >
                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/8 flex-shrink-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                        {deal.contact && <ContactAvatarLg contact={deal.contact} />}
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-base leading-snug truncate">{deal.title}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span
                                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                                    style={{ backgroundColor: `${stageColor}20`, color: stageColor, borderColor: `${stageColor}30` }}
                                >
                                    {deal.stage?.name || 'Sem etapa'}
                                </span>
                                {contact?.status && (
                                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusColors[contact.status] || 'bg-white/10 text-platinum border-white/10'}`}>
                                        {statusLabels[contact.status] || contact.status}
                                    </span>
                                )}
                                {deal.contact?.leadScore && <PipelineLeadScore score={deal.contact.leadScore} />}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-platinum/50 hover:text-white transition-colors flex-shrink-0 mt-0.5">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/8 flex-shrink-0 px-1">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setTab(t.id); setEditingContact(false); setEditingDeal(false); setSaveError(null) }}
                            className={cn(
                                'px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px',
                                tab === t.id
                                    ? 'text-gold border-gold'
                                    : 'text-platinum/50 border-transparent hover:text-platinum/80'
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Error */}
                    {saveError && (
                        <div className="mx-5 mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {saveError}
                        </div>
                    )}

                    {/* OVERVIEW TAB */}
                    {tab === 'overview' && (
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {deal.value != null && (
                                    <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-emerald-400/70 text-[10px] uppercase tracking-wider font-semibold">Valor</span>
                                        </div>
                                        <p className="text-emerald-300 font-bold text-sm">
                                            {(deal.value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                                        </p>
                                    </div>
                                )}
                                {deal.planInterest && (
                                    <div className="bg-gold/8 border border-gold/15 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Tag className="w-3.5 h-3.5 text-gold" />
                                            <span className="text-gold/70 text-[10px] uppercase tracking-wider font-semibold">Plano</span>
                                        </div>
                                        <p className="text-gold font-semibold text-sm truncate">{deal.planInterest}</p>
                                    </div>
                                )}
                                {deal.livesCount != null && (
                                    <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Users className="w-3.5 h-3.5 text-platinum/60" />
                                            <span className="text-platinum/50 text-[10px] uppercase tracking-wider font-semibold">Vidas</span>
                                        </div>
                                        <p className="text-white font-semibold text-sm">{deal.livesCount}</p>
                                    </div>
                                )}
                                <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Calendar className="w-3.5 h-3.5 text-platinum/60" />
                                        <span className="text-platinum/50 text-[10px] uppercase tracking-wider font-semibold">Criado em</span>
                                    </div>
                                    <p className="text-white/80 text-sm">{new Date(deal.createdAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                                {deal.assignedUser && (
                                    <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <User className="w-3.5 h-3.5 text-platinum/60" />
                                            <span className="text-platinum/50 text-[10px] uppercase tracking-wider font-semibold">Atendente</span>
                                        </div>
                                        <p className="text-white/80 text-sm truncate">{deal.assignedUser.name}</p>
                                    </div>
                                )}
                            </div>

                            {/* Contact quick info */}
                            {deal.contact && (
                                <div className="bg-white/4 border border-white/8 rounded-xl p-4 space-y-2.5">
                                    <p className="text-platinum/50 text-[10px] uppercase tracking-wider font-semibold">Contato</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-platinum/40 flex-shrink-0" />
                                        <span className="text-platinum/80 text-sm">{deal.contact.phone}</span>
                                    </div>
                                    {contact?.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-platinum/40 flex-shrink-0" />
                                            <span className="text-platinum/80 text-sm">{contact.email}</span>
                                        </div>
                                    )}
                                    {deal.contact.company && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-platinum/40 flex-shrink-0" />
                                            <span className="text-platinum/60 text-sm">{deal.contact.company}</span>
                                        </div>
                                    )}
                                    {contact?.tags && contact.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {contact.tags.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/8 rounded-full text-platinum/70 border border-white/10">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CONTACT TAB */}
                    {tab === 'contact' && (
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-platinum/50 text-xs uppercase tracking-wider font-semibold">Dados do Contato</p>
                                {!editingContact ? (
                                    <button
                                        onClick={() => setEditingContact(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-platinum/70 hover:text-white hover:bg-white/8 transition-all text-xs font-medium"
                                    >
                                        <Pencil className="w-3 h-3" /> Editar
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingContact(false); setSaveError(null) }}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-platinum/60 hover:text-white transition-all text-xs font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={saveContact}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/30 text-gold hover:bg-gold/20 transition-all text-xs font-medium disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                            Salvar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {loadingContact ? (
                                <div className="space-y-3">
                                    {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse h-10 bg-white/5 rounded-lg" />)}
                                </div>
                            ) : editingContact ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldInput label="Nome" value={cForm.name} onChange={v => setCForm(f => ({ ...f, name: v }))} />
                                        <FieldInput label="Telefone" value={cForm.phone} onChange={v => setCForm(f => ({ ...f, phone: v }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldInput label="E-mail" type="email" value={cForm.email} onChange={v => setCForm(f => ({ ...f, email: v }))} />
                                        <FieldInput label="Empresa" value={cForm.company} onChange={v => setCForm(f => ({ ...f, company: v }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldInput label="CPF / CNPJ" value={cForm.cpfCnpj} onChange={v => setCForm(f => ({ ...f, cpfCnpj: v }))} />
                                        <FieldSelect
                                            label="Status" value={cForm.status}
                                            onChange={v => setCForm(f => ({ ...f, status: v }))}
                                            options={[
                                                { value: 'new', label: 'Novo' }, { value: 'contacted', label: 'Contactado' },
                                                { value: 'qualified', label: 'Qualificado' }, { value: 'proposal', label: 'Proposta' },
                                                { value: 'won', label: 'Ganho' }, { value: 'lost', label: 'Perdido' },
                                            ]}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldSelect
                                            label="Origem" value={cForm.source}
                                            onChange={v => setCForm(f => ({ ...f, source: v }))}
                                            options={[
                                                { value: 'whatsapp', label: 'WhatsApp' }, { value: 'website', label: 'Website' }, { value: 'manual', label: 'Manual' },
                                            ]}
                                        />
                                        <FieldSelect
                                            label="Lead Score" value={cForm.leadScore}
                                            onChange={v => setCForm(f => ({ ...f, leadScore: v }))}
                                            options={[
                                                { value: '', label: 'Sem score' },
                                                { value: '1', label: '⭐ 1 – Frio' }, { value: '2', label: '⭐ 2 – Morno' },
                                                { value: '3', label: '⭐ 3 – Interessado' }, { value: '4', label: '⭐ 4 – Quente' },
                                                { value: '5', label: '⭐ 5 – Urgente' },
                                            ]}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldInput label="Interesse em plano" value={cForm.planInterest} onChange={v => setCForm(f => ({ ...f, planInterest: v }))} />
                                        <FieldInput label="Qtd. de vidas" type="number" value={cForm.livesCount} onChange={v => setCForm(f => ({ ...f, livesCount: v }))} />
                                    </div>
                                    <FieldTextarea label="Observações" value={cForm.notes} onChange={v => setCForm(f => ({ ...f, notes: v }))} placeholder="Anotações sobre o contato..." />
                                </div>
                            ) : (
                                <div className="space-y-0 divide-y divide-white/6">
                                    {[
                                        { icon: User, label: 'Nome', value: contact?.name || deal.contact?.name },
                                        { icon: Phone, label: 'Telefone', value: contact?.phone || deal.contact?.phone },
                                        { icon: Mail, label: 'E-mail', value: contact?.email },
                                        { icon: Building2, label: 'Empresa', value: contact?.company || deal.contact?.company },
                                        { icon: FileText, label: 'CPF / CNPJ', value: contact?.cpfCnpj },
                                        { icon: Layers, label: 'Origem', value: contact?.source ? (sourceLabels[contact.source] || contact.source) : null },
                                        { icon: Star, label: 'Lead Score', value: contact?.leadScore ? `${contact.leadScore}/5` : null },
                                        { icon: Tag, label: 'Plano de interesse', value: contact?.planInterest },
                                        { icon: Users, label: 'Qtd. de vidas', value: contact?.livesCount ? String(contact.livesCount) : null },
                                    ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="flex items-center gap-3 py-2.5">
                                            <Icon className="w-4 h-4 text-platinum/30 flex-shrink-0" />
                                            <span className="text-platinum/50 text-sm w-36 flex-shrink-0">{label}</span>
                                            <span className="text-white/80 text-sm flex-1 min-w-0 truncate">{value}</span>
                                        </div>
                                    ))}
                                    {contact?.tags && contact.tags.length > 0 && (
                                        <div className="flex items-start gap-3 py-2.5">
                                            <Tag className="w-4 h-4 text-platinum/30 flex-shrink-0 mt-0.5" />
                                            <span className="text-platinum/50 text-sm w-36 flex-shrink-0">Tags</span>
                                            <div className="flex flex-wrap gap-1 flex-1">
                                                {contact.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/8 rounded-full text-platinum/70 border border-white/10">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {contact?.notes && (
                                        <div className="flex items-start gap-3 py-2.5">
                                            <FileText className="w-4 h-4 text-platinum/30 flex-shrink-0 mt-0.5" />
                                            <span className="text-platinum/50 text-sm w-36 flex-shrink-0">Observações</span>
                                            <p className="text-platinum/60 text-sm flex-1 leading-relaxed">{contact.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DEAL TAB */}
                    {tab === 'deal' && (
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-platinum/50 text-xs uppercase tracking-wider font-semibold">Dados do Negócio</p>
                                {!editingDeal ? (
                                    <button
                                        onClick={() => setEditingDeal(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-platinum/70 hover:text-white hover:bg-white/8 transition-all text-xs font-medium"
                                    >
                                        <Pencil className="w-3 h-3" /> Editar
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingDeal(false); setSaveError(null) }}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-platinum/60 hover:text-white transition-all text-xs font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={saveDeal}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/30 text-gold hover:bg-gold/20 transition-all text-xs font-medium disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                            Salvar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {editingDeal ? (
                                <div className="space-y-3">
                                    <FieldInput label="Título do negócio" value={dForm.title} onChange={v => setDForm(f => ({ ...f, title: v }))} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldInput label="Valor (R$)" type="number" value={dForm.value} onChange={v => setDForm(f => ({ ...f, value: v }))} placeholder="0,00" />
                                        <FieldInput label="Qtd. de vidas" type="number" value={dForm.livesCount} onChange={v => setDForm(f => ({ ...f, livesCount: v }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldInput label="Plano de interesse" value={dForm.planInterest} onChange={v => setDForm(f => ({ ...f, planInterest: v }))} />
                                        <FieldSelect
                                            label="Etapa do pipeline" value={dForm.stageId}
                                            onChange={v => setDForm(f => ({ ...f, stageId: v }))}
                                            options={stages.map(s => ({ value: s.id, label: s.name }))}
                                        />
                                    </div>
                                    <FieldInput label="Previsão de fechamento" type="date" value={dForm.expectedCloseDate} onChange={v => setDForm(f => ({ ...f, expectedCloseDate: v }))} />
                                    <FieldTextarea label="Notas do negócio" value={dForm.notes} onChange={v => setDForm(f => ({ ...f, notes: v }))} placeholder="Detalhes sobre este negócio..." />
                                </div>
                            ) : (
                                <div className="space-y-0 divide-y divide-white/6">
                                    {[
                                        { icon: FileText, label: 'Título', value: deal.title },
                                        { icon: DollarSign, label: 'Valor', value: deal.value != null ? (deal.value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) : null },
                                        { icon: Tag, label: 'Plano', value: deal.planInterest },
                                        { icon: Users, label: 'Qtd. de vidas', value: deal.livesCount ? String(deal.livesCount) : null },
                                        { icon: Layers, label: 'Etapa', value: deal.stage?.name },
                                        { icon: User, label: 'Atendente', value: deal.assignedUser?.name },
                                        { icon: Calendar, label: 'Criado em', value: new Date(deal.createdAt).toLocaleDateString('pt-BR') },
                                    ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="flex items-center gap-3 py-2.5">
                                            <Icon className="w-4 h-4 text-platinum/30 flex-shrink-0" />
                                            <span className="text-platinum/50 text-sm w-36 flex-shrink-0">{label}</span>
                                            <span className="text-white/80 text-sm flex-1 min-w-0 truncate">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CONVERSATION TAB */}
                    {tab === 'conversation' && (
                        <div className="flex flex-col h-[480px]">
                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                                {loadingMsgs ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-5 h-5 text-platinum/40 animate-spin" />
                                    </div>
                                ) : !convId ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                                        <MessageSquare className="w-8 h-8 text-platinum/20" />
                                        <p className="text-platinum/40 text-sm">Nenhuma conversa encontrada para este contato.</p>
                                    </div>
                                ) : msgs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                                        <MessageSquare className="w-8 h-8 text-platinum/20" />
                                        <p className="text-platinum/40 text-sm">Sem mensagens ainda.</p>
                                    </div>
                                ) : (
                                    msgs.map(msg => {
                                        const isOut = msg.direction === 'outbound'
                                        return (
                                            <div key={msg.id} className={cn('flex', isOut ? 'justify-end' : 'justify-start')}>
                                                <div className={cn(
                                                    'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                                                    isOut
                                                        ? 'bg-gold/15 text-gold rounded-br-sm'
                                                        : 'bg-white/8 text-platinum/90 rounded-bl-sm'
                                                )}>
                                                    {msg.mediaUrl && (
                                                        <p className="text-[10px] opacity-60 mb-1">[{msg.messageType}]</p>
                                                    )}
                                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                    <p className={cn('text-[10px] mt-1', isOut ? 'text-gold/50 text-right' : 'text-platinum/30')}>
                                                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={msgsEndRef} />
                            </div>

                            {/* Input */}
                            {convId && (
                                <div className="border-t border-white/8 p-3 flex gap-2 flex-shrink-0">
                                    <textarea
                                        value={msgText}
                                        onChange={e => setMsgText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                                        placeholder="Digite uma mensagem... (Enter para enviar)"
                                        rows={2}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-platinum/30 focus:outline-none focus:border-gold/40 resize-none transition-all"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!msgText.trim() || sendingMsg}
                                        className="px-3 rounded-xl bg-gold/15 border border-gold/25 text-gold hover:bg-gold/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                    >
                                        {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {deal.contact && (
                    <div className="px-5 py-3.5 border-t border-white/8 flex gap-2.5 flex-shrink-0">
                        <Link
                            href={`/crm/contacts/${deal.contact.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-platinum/70 hover:text-white hover:bg-white/8 transition-all text-sm font-medium"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver perfil
                        </Link>
                        <Link
                            href={`/crm/conversations?contact=${deal.contact.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold hover:bg-gold/15 transition-all text-sm font-medium"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Ver conversa
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

function ContactAvatarLg({ contact }: { contact: Deal['contact'] }) {
    const [imgError, setImgError] = useState(false)
    const initials = contact?.name
        ? contact.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'

    if (contact?.profilePictureUrl && !imgError) {
        return (
            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                <Image src={contact.profilePictureUrl} alt={contact.name} width={44} height={44} className="w-full h-full object-cover" onError={() => setImgError(true)} />
            </div>
        )
    }
    return (
        <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ring-2 ring-white/10 bg-gradient-to-br from-gold/30 to-gold/10 text-gold">
            {initials}
        </div>
    )
}

function ContactAvatar({ contact }: { contact: Deal['contact'] }) {
    const [imgError, setImgError] = useState(false)
    const initials = contact?.name
        ? contact.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'

    if (contact?.profilePictureUrl && !imgError) {
        return (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                <Image
                    src={contact.profilePictureUrl}
                    alt={contact.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            </div>
        )
    }

    return (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ring-2 ring-white/10 bg-gradient-to-br from-gold/30 to-gold/10 text-gold">
            {initials}
        </div>
    )
}

export default function PipelinePage() {
    const [stages, setStages] = useState<PipelineStage[]>([])
    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [draggedDeal, setDraggedDeal] = useState<string | null>(null)
    const [dragOverStage, setDragOverStage] = useState<string | null>(null)
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const loadData = useCallback(async () => {
        try {
            const [stagesRes, dealsRes] = await Promise.all([
                fetch('/api/crm/pipeline/stages'),
                fetch('/api/crm/deals'),
            ])
            const stagesData = await stagesRes.json()
            const dealsData = await dealsRes.json()
            setStages(stagesData.data || [])
            setDeals(dealsData.data || [])
        } catch (error) {
            console.error('Error loading pipeline:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const checkScroll = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }, [])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        checkScroll()
        el.addEventListener('scroll', checkScroll)
        window.addEventListener('resize', checkScroll)
        return () => {
            el.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
        }
    }, [checkScroll, stages])

    const scroll = (dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
    }

    const getDealsForStage = (stageId: string) =>
        deals.filter(d => d.stage?.id === stageId)

    const getStageTotalValue = (stageId: string) => {
        const total = getDealsForStage(stageId).reduce((sum, d) => sum + (d.value ?? 0), 0)
        return total > 0 ? (total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) : null
    }

    const handleDragStart = (dealId: string) => setDraggedDeal(dealId)

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault()
        setDragOverStage(stageId)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if leaving the column entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverStage(null)
        }
    }

    const handleDrop = async (e: React.DragEvent, stageId: string) => {
        e.preventDefault()
        setDragOverStage(null)

        if (!draggedDeal) return

        setDeals(prev => prev.map(d =>
            d.id === draggedDeal
                ? { ...d, stage: stages.find(s => s.id === stageId) ? { ...stages.find(s => s.id === stageId)! } : d.stage }
                : d
        ))

        try {
            await fetch(`/api/crm/deals/${draggedDeal}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stageId }),
            })
        } catch {
            loadData()
        }

        setDraggedDeal(null)
    }

    const handleDragEnd = () => {
        setDraggedDeal(null)
        setDragOverStage(null)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse h-8 bg-white/10 rounded w-1/3" />
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse h-96 bg-white/10 rounded-2xl w-72 flex-shrink-0" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pipeline</h1>
                    <p className="text-platinum/60 text-sm mt-0.5">{deals.length} deals ativos</p>
                </div>

                {/* Scroll arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-platinum/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-platinum/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Deal Detail Modal */}
            <AnimatePresence>
                {selectedDeal && (
                    <DealDetailModal deal={selectedDeal} stages={stages} onClose={() => setSelectedDeal(null)} onUpdated={loadData} />
                )}
            </AnimatePresence>

            {/* Kanban Board */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 flex-1 scroll-smooth"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                }}
            >
                {stages.map((stage, index) => {
                    const stageDeals = getDealsForStage(stage.id)
                    const totalValue = getStageTotalValue(stage.id)
                    const isOver = dragOverStage === stage.id
                    const stageColor = stage.color || '#666666'

                    return (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex-shrink-0 w-72 flex flex-col"
                            onDragOver={(e) => handleDragOver(e, stage.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, stage.id)}
                        >
                            {/* Column Header */}
                            <div
                                className="rounded-xl mb-2 px-3 py-2.5 border"
                                style={{
                                    backgroundColor: `${stageColor}15`,
                                    borderColor: `${stageColor}30`,
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: stageColor }}
                                        />
                                        <span className="text-white font-semibold text-sm">{stage.name}</span>
                                    </div>
                                    <span
                                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: `${stageColor}25`,
                                            color: stageColor,
                                        }}
                                    >
                                        {stageDeals.length}
                                    </span>
                                </div>
                                {totalValue && (
                                    <div className="flex items-center gap-1 mt-1.5">
                                        <DollarSign className="w-3 h-3 text-platinum/40" />
                                        <span className="text-platinum/60 text-[11px]">{totalValue}</span>
                                    </div>
                                )}
                            </div>

                            {/* Column Body */}
                            <div
                                className={cn(
                                    'rounded-2xl border p-3 flex-1 min-h-[400px] space-y-2.5 transition-all duration-150',
                                    isOver
                                        ? 'border-dashed bg-charcoal/80'
                                        : 'bg-charcoal/40 border-white/5'
                                )}
                                style={isOver ? { borderColor: `${stageColor}60`, backgroundColor: `${stageColor}08` } : {}}
                            >
                                {stageDeals.length > 0 ? (
                                    stageDeals.map(deal => (
                                        <motion.div
                                            key={deal.id}
                                            layout
                                            draggable
                                            onDragStart={() => handleDragStart(deal.id)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => { if (!draggedDeal) setSelectedDeal(deal) }}
                                            className={cn(
                                                'bg-[#1a1a1a] rounded-xl p-3.5 border border-white/8 cursor-pointer active:cursor-grabbing',
                                                'hover:border-white/20 hover:shadow-lg hover:shadow-black/30',
                                                'transition-all duration-150 group',
                                                draggedDeal === deal.id && 'opacity-40 scale-95'
                                            )}
                                        >
                                            {/* Deal title */}
                                            <p className="text-white font-medium text-sm leading-snug mb-2.5 group-hover:text-white/90">
                                                {deal.title}
                                            </p>

                                            {/* Contact */}
                                            {deal.contact && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ContactAvatar contact={deal.contact} />
                                                    <div className="min-w-0">
                                                        <p className="text-white/80 text-xs font-medium truncate">{deal.contact.name}</p>
                                                        {deal.contact.company && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Building2 className="w-2.5 h-2.5 text-platinum/40 flex-shrink-0" />
                                                                <p className="text-platinum/50 text-[10px] truncate">{deal.contact.company}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    {deal.planInterest && (
                                                        <span className="text-gold text-[10px] font-semibold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/15">
                                                            {deal.planInterest}
                                                        </span>
                                                    )}
                                                    {deal.contact?.leadScore && (
                                                        <PipelineLeadScore score={deal.contact.leadScore} />
                                                    )}
                                                </div>
                                                {deal.value != null && (
                                                    <span className="text-emerald-400 text-xs font-bold">
                                                        {(deal.value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div
                                        className={cn(
                                            'flex flex-col items-center justify-center h-24 gap-2 rounded-xl border border-dashed',
                                            isOver ? 'border-current' : 'border-white/10'
                                        )}
                                        style={isOver ? { borderColor: `${stageColor}50`, color: stageColor } : {}}
                                    >
                                        {isOver ? (
                                            <p className="text-xs font-medium">Soltar aqui</p>
                                        ) : (
                                            <p className="text-platinum/25 text-xs">Sem deals</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
