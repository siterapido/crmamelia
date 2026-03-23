'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Phone, Mail, Building2, FileText, MessageSquare,
    Target, Calendar, User, Sparkles, Edit2, Save, X, Tag,
    Plus, Trash2, Clock, PhoneCall, Video, AtSign, CheckSquare,
    Bell, Star
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
    leadScore: number | null
    address: string | null
    profilePictureUrl: string | null
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

interface ContactTag {
    id: string
    tag: string
}

interface Activity {
    id: string
    type: string
    title: string
    description: string | null
    createdAt: string
    user: { id: string; name: string } | null
}

interface Followup {
    id: string
    scheduledAt: string
    message: string
    sent: boolean
    createdAt: string
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

const activityIcons: Record<string, React.ElementType> = {
    note: FileText,
    call: PhoneCall,
    meeting: Video,
    email: AtSign,
    task: CheckSquare,
    status_change: Target,
}

const activityLabels: Record<string, string> = {
    note: 'Nota',
    call: 'Ligação',
    meeting: 'Reunião',
    email: 'Email',
    task: 'Tarefa',
    status_change: 'Status',
}

export default function ContactDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [contact, setContact] = useState<ContactDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [editForm, setEditForm] = useState<Partial<ContactDetail>>({})
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'info' | 'activities' | 'followups'>('info')

    // Tags state
    const [tags, setTags] = useState<ContactTag[]>([])
    const [newTag, setNewTag] = useState('')
    const [addingTag, setAddingTag] = useState(false)

    // Activities state
    const [activities, setActivities] = useState<Activity[]>([])
    const [showActivityForm, setShowActivityForm] = useState(false)
    const [activityForm, setActivityForm] = useState({ type: 'note', title: '', description: '' })
    const [savingActivity, setSavingActivity] = useState(false)

    // Follow-ups state
    const [followups, setFollowups] = useState<Followup[]>([])
    const [showFollowupForm, setShowFollowupForm] = useState(false)
    const [followupForm, setFollowupForm] = useState({ scheduledAt: '', message: '' })
    const [savingFollowup, setSavingFollowup] = useState(false)

    useEffect(() => {
        if (!params.id) return
        const id = params.id as string

        Promise.all([
            fetch(`/api/crm/contacts/${id}`).then(r => r.json()),
            fetch(`/api/crm/contacts/${id}/tags`).then(r => r.json()),
            fetch(`/api/crm/contacts/${id}/activities`).then(r => r.json()),
            fetch(`/api/crm/followups?contactId=${id}`).then(r => r.json()),
        ])
            .then(([contactData, tagsData, activitiesData, followupsData]) => {
                setContact(contactData)
                setEditForm({
                    name: contactData.name,
                    phone: contactData.phone,
                    email: contactData.email,
                    company: contactData.company,
                    notes: contactData.notes,
                    planInterest: contactData.planInterest,
                })
                setTags(tagsData.data || [])
                setActivities(activitiesData.data || [])
                setFollowups(followupsData.data || [])
            })
            .catch(() => router.push('/crm/contacts'))
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

    const addTag = async () => {
        if (!contact || !newTag.trim()) return
        setAddingTag(true)
        try {
            const res = await fetch(`/api/crm/contacts/${contact.id}/tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag: newTag.trim() }),
            })
            if (res.ok) {
                const data = await res.json()
                if (data.tag) setTags(prev => [...prev, data.tag])
                setNewTag('')
            }
        } finally {
            setAddingTag(false)
        }
    }

    const removeTag = async (tag: string) => {
        if (!contact) return
        await fetch(`/api/crm/contacts/${contact.id}/tags`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag }),
        })
        setTags(prev => prev.filter(t => t.tag !== tag))
    }

    const addActivity = async () => {
        if (!contact || !activityForm.title.trim()) return
        setSavingActivity(true)
        try {
            const res = await fetch(`/api/crm/contacts/${contact.id}/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityForm),
            })
            if (res.ok) {
                const data = await res.json()
                setActivities(prev => [data.activity, ...prev])
                setShowActivityForm(false)
                setActivityForm({ type: 'note', title: '', description: '' })
            }
        } finally {
            setSavingActivity(false)
        }
    }

    const addFollowup = async () => {
        if (!contact || !followupForm.message.trim() || !followupForm.scheduledAt) return
        setSavingFollowup(true)
        try {
            const res = await fetch('/api/crm/followups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactId: contact.id, ...followupForm }),
            })
            if (res.ok) {
                const data = await res.json()
                setFollowups(prev => [...prev, data.followup])
                setShowFollowupForm(false)
                setFollowupForm({ scheduledAt: '', message: '' })
            }
        } finally {
            setSavingFollowup(false)
        }
    }

    const deleteFollowup = async (id: string) => {
        await fetch(`/api/crm/followups/${id}`, { method: 'DELETE' })
        setFollowups(prev => prev.filter(f => f.id !== id))
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
                <Link href="/crm/contacts" className="p-2 rounded-lg bg-white/5 text-platinum hover:bg-white/10 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3 flex-1">
                    {contact.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={contact.profilePictureUrl} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                            <span className="text-gold text-xl font-bold">{contact.name.charAt(0)}</span>
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-white">{contact.name}</h1>
                        <p className="text-platinum">{contact.phone}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[contact.status] || 'bg-white/10 text-platinum border-white/10'}`}>
                        {statusLabels[contact.status] || contact.status}
                    </span>
                    {contact.leadScore && (
                        <span className={cn(
                            'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border',
                            contact.leadScore >= 4 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                            contact.leadScore >= 3 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                            contact.leadScore >= 2 ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' :
                            'text-blue-400 bg-blue-500/10 border-blue-500/20'
                        )}>
                            <Star className="w-3.5 h-3.5" fill="currentColor" />
                            {contact.leadScore}/5
                        </span>
                    )}
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
                {tags.map(t => (
                    <span
                        key={t.id}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20 group"
                    >
                        <Tag className="w-3 h-3" />
                        {t.tag}
                        <button
                            onClick={() => removeTag(t.tag)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <div className="flex items-center gap-1">
                    <input
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTag()}
                        placeholder="+ Adicionar tag"
                        className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-platinum text-xs focus:outline-none focus:border-gold/50 w-32"
                    />
                    {newTag.trim() && (
                        <button
                            onClick={addTag}
                            disabled={addingTag}
                            className="p-1 rounded-full bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                        {[
                            { key: 'info', label: 'Informações' },
                            { key: 'activities', label: `Atividades (${activities.length})` },
                            { key: 'followups', label: `Follow-ups (${followups.length})` },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={cn(
                                    'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                                    activeTab === tab.key
                                        ? 'bg-charcoal text-white shadow'
                                        : 'text-platinum hover:text-white'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-charcoal rounded-2xl p-6 border border-white/10"
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
                    )}

                    {/* Activities Tab */}
                    {activeTab === 'activities' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-charcoal rounded-2xl p-6 border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">Atividades</h2>
                                <button
                                    onClick={() => setShowActivityForm(v => !v)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-xl text-sm hover:bg-gold/20 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar
                                </button>
                            </div>

                            {showActivityForm && (
                                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            value={activityForm.type}
                                            onChange={e => setActivityForm(f => ({ ...f, type: e.target.value }))}
                                            className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50"
                                        >
                                            {Object.entries(activityLabels).map(([k, v]) => (
                                                <option key={k} value={k}>{v}</option>
                                            ))}
                                        </select>
                                        <input
                                            value={activityForm.title}
                                            onChange={e => setActivityForm(f => ({ ...f, title: e.target.value }))}
                                            placeholder="Título *"
                                            className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50"
                                        />
                                    </div>
                                    <textarea
                                        value={activityForm.description}
                                        onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Descrição (opcional)"
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowActivityForm(false)}
                                            className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-platinum text-sm hover:bg-white/10"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={addActivity}
                                            disabled={savingActivity || !activityForm.title.trim()}
                                            className="px-4 py-2 bg-gold-primary text-black font-semibold rounded-xl text-sm hover:opacity-90 disabled:opacity-50"
                                        >
                                            {savingActivity ? 'Salvando...' : 'Salvar'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {activities.map((activity, i) => {
                                    const Icon = activityIcons[activity.type] || FileText
                                    return (
                                        <div key={activity.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-4 h-4 text-gold" />
                                                </div>
                                                {i < activities.length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-white/10 mt-2" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-white font-medium">{activity.title}</p>
                                                        {activity.description && (
                                                            <p className="text-platinum text-sm mt-1">{activity.description}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-platinum/50 text-xs flex-shrink-0 ml-3">
                                                        {new Date(activity.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                                {activity.user && (
                                                    <p className="text-platinum/50 text-xs mt-1">por {activity.user.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                                {activities.length === 0 && (
                                    <div className="text-center py-8">
                                        <Clock className="w-10 h-10 text-platinum/30 mx-auto mb-3" />
                                        <p className="text-platinum text-sm">Nenhuma atividade registrada</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Follow-ups Tab */}
                    {activeTab === 'followups' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-charcoal rounded-2xl p-6 border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">Follow-ups Agendados</h2>
                                <button
                                    onClick={() => setShowFollowupForm(v => !v)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-xl text-sm hover:bg-gold/20 transition-colors"
                                >
                                    <Bell className="w-4 h-4" />
                                    Agendar
                                </button>
                            </div>

                            {showFollowupForm && (
                                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                                    <div>
                                        <label className="block text-platinum text-sm mb-1">Data e Hora</label>
                                        <input
                                            type="datetime-local"
                                            value={followupForm.scheduledAt}
                                            onChange={e => setFollowupForm(f => ({ ...f, scheduledAt: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-platinum text-sm mb-1">Mensagem de lembrete</label>
                                        <textarea
                                            value={followupForm.message}
                                            onChange={e => setFollowupForm(f => ({ ...f, message: e.target.value }))}
                                            rows={2}
                                            placeholder="Ex: Ligar para fechar proposta"
                                            className="w-full px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white text-sm focus:outline-none focus:border-gold/50 resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowFollowupForm(false)}
                                            className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-platinum text-sm hover:bg-white/10"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={addFollowup}
                                            disabled={savingFollowup || !followupForm.message.trim() || !followupForm.scheduledAt}
                                            className="px-4 py-2 bg-gold-primary text-black font-semibold rounded-xl text-sm hover:opacity-90 disabled:opacity-50"
                                        >
                                            {savingFollowup ? 'Salvando...' : 'Agendar'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {followups.map(f => (
                                    <div
                                        key={f.id}
                                        className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                            <Bell className="w-4 h-4 text-gold" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm">{f.message}</p>
                                            <p className="text-gold text-xs mt-1">
                                                {new Date(f.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteFollowup(f.id)}
                                            className="p-1.5 rounded-lg text-platinum hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {followups.length === 0 && (
                                    <div className="text-center py-8">
                                        <Bell className="w-10 h-10 text-platinum/30 mx-auto mb-3" />
                                        <p className="text-platinum text-sm">Nenhum follow-up agendado</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

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
                                        href={`/crm/conversations`}
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
