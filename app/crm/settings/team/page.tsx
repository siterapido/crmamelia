'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, Pencil, Trash2, Loader2, X, Mail, User, Shield,
    Users, ChevronRight, ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { ROLE_LABELS, ALL_ROLES, UserRole } from '@/lib/auth/rbac'
import { cn } from '@/lib/utils/cn'

interface TeamUser {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string
    createdAt: string
}

function normalizeRole(role: string): string {
    return role === 'agent' ? 'vendedor' : role
}

function MembersTab() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<TeamUser[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<TeamUser | null>(null)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'vendedor' as UserRole,
    })

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/crm/users', { credentials: 'include' })
            const data = await res.json()
            setUsers(data.data || [])
        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const url = editingUser ? `/api/crm/users/${editingUser.id}` : '/api/crm/users'
            const method = editingUser ? 'PATCH' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error || 'Erro ao salvar usuário')
                return
            }
            setShowModal(false)
            setEditingUser(null)
            resetForm()
            loadUsers()
        } catch (error) {
            console.error('Error saving user:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return
        try {
            const res = await fetch(`/api/crm/users/${id}`, { method: 'DELETE', credentials: 'include' })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error || 'Erro ao excluir usuário')
                return
            }
            loadUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    const openEditModal = (user: TeamUser) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: normalizeRole(user.role) as UserRole,
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'vendedor' })
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadgeColor = (role: string) => {
        switch (normalizeRole(role)) {
            case 'admin': return 'bg-red-500/10 text-red-600 border-red-500/20'
            case 'gestor': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
            case 'produtor': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
            default: return 'bg-green-500/10 text-green-600 border-green-500/20'
        }
    }

    const availableRoles = currentUser?.role === 'gestor'
        ? (['vendedor'] as UserRole[])
        : ALL_ROLES

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-[var(--crm-text-muted)] text-sm">Gerencie usuários do sistema</p>
                <button
                    onClick={() => { resetForm(); setEditingUser(null); setShowModal(true) }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--crm-accent)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Novo Usuário
                </button>
            </div>

            <div className="bg-[var(--crm-surface)] rounded-2xl border border-[var(--crm-border)]">
                <div className="p-6 border-b border-[var(--crm-border)]">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--crm-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Buscar usuários..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[var(--crm-surface-2)] border border-[var(--crm-border)] rounded-xl text-[var(--crm-text)] placeholder:text-[var(--crm-text-muted)]/50 focus:outline-none focus:border-[var(--crm-accent)] transition-colors"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[var(--crm-accent)] animate-spin" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <User className="w-12 h-12 text-[var(--crm-text-muted)]/50 mx-auto mb-3" />
                        <p className="text-[var(--crm-text-muted)]">Nenhum usuário encontrado</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--crm-border)]">
                                    <th className="text-left p-4 text-[var(--crm-text-muted)] font-medium">Usuário</th>
                                    <th className="text-left p-4 text-[var(--crm-text-muted)] font-medium">Email</th>
                                    <th className="text-left p-4 text-[var(--crm-text-muted)] font-medium">Função</th>
                                    <th className="text-left p-4 text-[var(--crm-text-muted)] font-medium">Criado em</th>
                                    <th className="text-right p-4 text-[var(--crm-text-muted)] font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-[var(--crm-border)]/50 hover:bg-[var(--crm-surface-2)]">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[var(--crm-accent-bg)] rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-[var(--crm-accent)]" />
                                                </div>
                                                <span className="text-[var(--crm-text)] font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[var(--crm-text-muted)]">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                {ROLE_LABELS[normalizeRole(user.role) as UserRole] || user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[var(--crm-text-muted)]">
                                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(user)} className="p-2 text-[var(--crm-text-muted)] hover:text-[var(--crm-accent)] transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {user.id !== currentUser?.id && (
                                                    <button onClick={() => handleDelete(user.id)} className="p-2 text-[var(--crm-text-muted)] hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[var(--crm-surface)] rounded-2xl p-6 w-full max-w-md border border-[var(--crm-border)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[var(--crm-text)]">
                                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--crm-text-muted)] mb-2">Nome</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--crm-text-muted)]" />
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full pl-12 pr-4 py-3 bg-[var(--crm-surface-2)] border border-[var(--crm-border)] rounded-xl text-[var(--crm-text)] focus:outline-none focus:border-[var(--crm-accent)]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--crm-text-muted)] mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--crm-text-muted)]" />
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full pl-12 pr-4 py-3 bg-[var(--crm-surface-2)] border border-[var(--crm-border)] rounded-xl text-[var(--crm-text)] focus:outline-none focus:border-[var(--crm-accent)]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--crm-text-muted)] mb-2">
                                        {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--crm-text-muted)]" />
                                        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingUser} minLength={6} className="w-full pl-12 pr-4 py-3 bg-[var(--crm-surface-2)] border border-[var(--crm-border)] rounded-xl text-[var(--crm-text)] focus:outline-none focus:border-[var(--crm-accent)]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--crm-text-muted)] mb-2">Função</label>
                                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full px-4 py-3 bg-[var(--crm-surface-2)] border border-[var(--crm-border)] rounded-xl text-[var(--crm-text)] focus:outline-none focus:border-[var(--crm-accent)]">
                                        {availableRoles.map((role) => (
                                            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 px-4 border border-[var(--crm-border)] text-[var(--crm-text)] font-semibold rounded-xl hover:bg-[var(--crm-surface-2)]">Cancelar</button>
                                    <button type="submit" disabled={saving} className="flex-1 py-3 px-4 bg-[var(--crm-accent)] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                                        {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                                        {editingUser ? 'Salvar' : 'Criar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function StructureTab() {
    const [members, setMembers] = useState<TeamUser[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState<string | null>(null)

    useEffect(() => {
        loadMembers()
    }, [])

    const loadMembers = async () => {
        try {
            const res = await fetch('/api/crm/users', { credentials: 'include' })
            const data = await res.json()
            const users = (data.data || []) as TeamUser[]
            setMembers(users.filter(u => normalizeRole(u.role) === 'gestor' || normalizeRole(u.role) === 'vendedor'))
        } catch (error) {
            console.error('Error loading team:', error)
        } finally {
            setLoading(false)
        }
    }

    const getRoleColor = (role: string) => {
        switch (normalizeRole(role)) {
            case 'gestor': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
            case 'vendedor': return 'bg-green-500/10 text-green-600 border-green-500/20'
            default: return 'bg-[var(--crm-accent-bg)] text-[var(--crm-accent)] border-[var(--crm-border)]'
        }
    }

    const leads = members.filter(m => normalizeRole(m.role) === 'gestor')
    const sellers = members.filter(m => normalizeRole(m.role) === 'vendedor')

    if (loading) {
        return (
            <div className="p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[var(--crm-accent)] animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-[var(--crm-surface)] rounded-2xl p-6 border border-[var(--crm-border)]">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-[var(--crm-accent)]" />
                    <h2 className="text-xl font-semibold text-[var(--crm-text)]">Gestores</h2>
                </div>
                {leads.length === 0 ? (
                    <p className="text-[var(--crm-text-muted)] text-center py-8">Nenhum gestor encontrado</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leads.map((lead, index) => (
                            <motion.div
                                key={lead.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                                className={cn(
                                    'p-4 rounded-xl border cursor-pointer transition-all',
                                    selectedLead === lead.id
                                        ? 'bg-[var(--crm-accent-bg)] border-[var(--crm-accent)]/30'
                                        : 'bg-[var(--crm-surface-2)] border-[var(--crm-border)] hover:border-[var(--crm-accent)]/20'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[var(--crm-text)] font-medium">{lead.name}</h3>
                                        <p className="text-sm text-[var(--crm-text-muted)]">{lead.email}</p>
                                    </div>
                                    <ChevronRight className={cn('w-5 h-5 text-[var(--crm-text-muted)] transition-transform', selectedLead === lead.id && 'rotate-90')} />
                                </div>
                                <div className="mt-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(lead.role)}`}>
                                        {ROLE_LABELS[normalizeRole(lead.role) as UserRole]}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-[var(--crm-surface)] rounded-2xl p-6 border border-[var(--crm-border)]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-[var(--crm-accent)]" />
                        <h2 className="text-xl font-semibold text-[var(--crm-text)]">Vendedores</h2>
                    </div>
                    <span className="text-sm text-[var(--crm-text-muted)]">{sellers.length} vendedores</span>
                </div>
                {sellers.length === 0 ? (
                    <p className="text-[var(--crm-text-muted)] text-center py-8">Nenhum vendedor encontrado</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--crm-border)]">
                                    <th className="text-left p-4 text-[var(--crm-text-muted)] font-medium">Vendedor</th>
                                    <th className="text-left p-4 text-[var(--crm-text-muted)] font-medium">Email</th>
                                    <th className="text-left p-4 text-[var(--crm-text-muted)] font-medium">Gestor</th>
                                    <th className="text-right p-4 text-[var(--crm-text-muted)] font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers.map((seller) => (
                                    <tr key={seller.id} className="border-b border-[var(--crm-border)]/50 hover:bg-[var(--crm-surface-2)]">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-green-600" />
                                                </div>
                                                <span className="text-[var(--crm-text)] font-medium">{seller.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[var(--crm-text-muted)]">{seller.email}</td>
                                        <td className="p-4">
                                            <select className="bg-[var(--crm-surface-2)] border border-[var(--crm-border)] rounded-lg px-3 py-2 text-[var(--crm-text)] text-sm focus:outline-none focus:border-[var(--crm-accent)]">
                                                <option value="">Selecionar gestor</option>
                                                {leads.map((lead) => (
                                                    <option key={lead.id} value={lead.id}>{lead.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-[var(--crm-accent)] text-sm flex items-center gap-1 ml-auto">
                                                Ver detalhes
                                                <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function TeamPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const tab = searchParams.get('tab') === 'structure' ? 'structure' : 'members'

    const setTab = (next: 'members' | 'structure') => {
        const params = new URLSearchParams(searchParams.toString())
        if (next === 'structure') {
            params.set('tab', 'structure')
        } else {
            params.delete('tab')
        }
        router.replace(`/crm/settings/team${params.toString() ? `?${params}` : ''}`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--crm-text)]">Equipe</h1>
                <p className="text-[var(--crm-text-muted)] text-sm mt-0.5">Membros e estrutura da equipe</p>
            </div>

            <div className="flex gap-1 p-1 bg-[var(--crm-surface-2)] rounded-xl w-fit border border-[var(--crm-border)]">
                {(['members', 'structure'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            tab === t
                                ? 'bg-[var(--crm-surface)] text-[var(--crm-text)] shadow-sm'
                                : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                        )}
                    >
                        {t === 'members' ? 'Membros' : 'Estrutura'}
                    </button>
                ))}
            </div>

            {tab === 'members' ? <MembersTab /> : <StructureTab />}
        </div>
    )
}

export default function TeamSettingsPage() {
    return (
        <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-[var(--crm-accent)] animate-spin" /></div>}>
            <TeamPageContent />
        </Suspense>
    )
}
