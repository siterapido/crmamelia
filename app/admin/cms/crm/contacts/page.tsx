'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Plus, Search, Phone, Building2, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface Contact {
    id: string
    name: string
    phone: string
    email: string | null
    company: string | null
    source: string
    status: string
    planInterest: string | null
    livesCount: number | null
    lastContactAt: string | null
    createdAt: string
    assignedUser: { id: string; name: string } | null
}

const statusLabels: Record<string, string> = {
    new: 'Novo',
    contacted: 'Contactado',
    qualified: 'Qualificado',
    proposal: 'Proposta',
    won: 'Ganho',
    lost: 'Perdido',
}

const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400',
    contacted: 'bg-yellow-500/10 text-yellow-400',
    qualified: 'bg-gold/10 text-gold',
    proposal: 'bg-purple-500/10 text-purple-400',
    won: 'bg-green-500/10 text-green-400',
    lost: 'bg-red-500/10 text-red-400',
}

const sourceLabels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    website: 'Website',
    manual: 'Manual',
}

const filterStatuses = ['all', 'new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [showNewForm, setShowNewForm] = useState(false)

    const loadContacts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' })
            if (search) params.set('search', search)
            if (statusFilter !== 'all') params.set('status', statusFilter)

            const res = await fetch(`/api/crm/contacts?${params}`)
            const data = await res.json()
            setContacts(data.data || [])
            setTotalPages(data.totalPages || 1)
            setTotal(data.total || 0)
        } catch (error) {
            console.error('Error loading contacts:', error)
        } finally {
            setLoading(false)
        }
    }, [page, search, statusFilter])

    useEffect(() => { loadContacts() }, [loadContacts])

    // Debounce search
    const [searchInput, setSearchInput] = useState('')
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(searchInput)
            setPage(1)
        }, 300)
        return () => clearTimeout(timeout)
    }, [searchInput])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Contatos</h1>
                    <p className="text-platinum mt-1">{total} contatos encontrados</p>
                </div>
                <button
                    onClick={() => setShowNewForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Novo Contato
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, telefone, email ou empresa..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-charcoal rounded-xl border border-white/10 text-white placeholder:text-platinum/50 focus:outline-none focus:border-gold/50 transition-colors"
                    />
                    {searchInput && (
                        <button
                            onClick={() => setSearchInput('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-platinum hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Status Pills */}
            <div className="flex gap-2 flex-wrap">
                {filterStatuses.map(status => (
                    <button
                        key={status}
                        onClick={() => { setStatusFilter(status); setPage(1) }}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            statusFilter === status
                                ? 'bg-gold/10 text-gold border border-gold/20'
                                : 'bg-white/5 text-platinum border border-white/10 hover:bg-white/10'
                        )}
                    >
                        {status === 'all' ? 'Todos' : statusLabels[status]}
                    </button>
                ))}
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-charcoal rounded-2xl border border-white/10 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left text-platinum text-xs uppercase tracking-wider px-6 py-4">Nome</th>
                                <th className="text-left text-platinum text-xs uppercase tracking-wider px-6 py-4">Telefone</th>
                                <th className="text-left text-platinum text-xs uppercase tracking-wider px-6 py-4 hidden md:table-cell">Empresa</th>
                                <th className="text-left text-platinum text-xs uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Fonte</th>
                                <th className="text-left text-platinum text-xs uppercase tracking-wider px-6 py-4">Status</th>
                                <th className="text-left text-platinum text-xs uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Último Contato</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        <td className="px-6 py-4" colSpan={6}>
                                            <div className="animate-pulse h-5 bg-white/10 rounded w-3/4" />
                                        </td>
                                    </tr>
                                ))
                            ) : contacts.length > 0 ? (
                                contacts.map(contact => (
                                    <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/crm/contacts/${contact.id}`} className="group">
                                                <p className="text-white font-medium group-hover:text-gold transition-colors">
                                                    {contact.name}
                                                </p>
                                                {contact.email && (
                                                    <p className="text-platinum text-sm">{contact.email}</p>
                                                )}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-platinum flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {contact.phone}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {contact.company ? (
                                                <span className="text-platinum flex items-center gap-2">
                                                    <Building2 className="w-4 h-4" />
                                                    {contact.company}
                                                </span>
                                            ) : (
                                                <span className="text-platinum/50">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-platinum text-sm">
                                                {sourceLabels[contact.source] || contact.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[contact.status] || 'bg-white/10 text-platinum'}`}>
                                                {statusLabels[contact.status] || contact.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-platinum text-sm">
                                                {contact.lastContactAt
                                                    ? new Date(contact.lastContactAt).toLocaleDateString('pt-BR')
                                                    : '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <UserCheck className="w-12 h-12 text-platinum/50 mx-auto mb-3" />
                                        <p className="text-platinum">Nenhum contato encontrado</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                        <p className="text-platinum text-sm">
                            Página {page} de {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg text-sm bg-white/5 text-platinum hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-lg text-sm bg-white/5 text-platinum hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* New Contact Modal */}
            {showNewForm && (
                <NewContactModal
                    onClose={() => setShowNewForm(false)}
                    onCreated={() => { setShowNewForm(false); loadContacts() }}
                />
            )}
        </div>
    )
}

function NewContactModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', notes: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const res = await fetch('/api/crm/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, source: 'manual' }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erro ao criar contato')
                return
            }

            onCreated()
        } catch {
            setError('Erro ao criar contato')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-charcoal rounded-2xl border border-white/10 p-8 w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-4"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Novo Contato</h2>
                    <button onClick={onClose} className="text-platinum hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-platinum text-sm mb-1">Nome *</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-platinum/50 focus:outline-none focus:border-gold/50"
                            placeholder="Nome completo"
                        />
                    </div>
                    <div>
                        <label className="block text-platinum text-sm mb-1">Telefone *</label>
                        <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-platinum/50 focus:outline-none focus:border-gold/50"
                            placeholder="+5521999999999"
                        />
                    </div>
                    <div>
                        <label className="block text-platinum text-sm mb-1">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-platinum/50 focus:outline-none focus:border-gold/50"
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-platinum text-sm mb-1">Empresa</label>
                        <input
                            type="text"
                            value={form.company}
                            onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-platinum/50 focus:outline-none focus:border-gold/50"
                            placeholder="Nome da empresa"
                        />
                    </div>
                    <div>
                        <label className="block text-platinum text-sm mb-1">Observações</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-platinum/50 focus:outline-none focus:border-gold/50 resize-none"
                            placeholder="Notas sobre o contato..."
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-platinum hover:bg-white/10 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-3 rounded-xl bg-gold-primary text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Criar Contato'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
