'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Trash2, Edit2, Shield, User, Save, X } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface UserItem {
    id: string
    name: string
    email: string
    role: string
    avatarUrl: string | null
    createdAt: string
}

const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    agent: 'Atendente',
    editor: 'Editor',
}

const roleColors: Record<string, string> = {
    admin: 'bg-gold/10 text-gold border-gold/20',
    agent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    editor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function UsersPage() {
    const { user: currentUser } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<UserItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editUser, setEditUser] = useState<UserItem | null>(null)
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [canEdit, setCanEdit] = useState(false)

    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'gestor') {
            router.push('/crm')
        }
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'gestor')) {
            setCanEdit(true)
        }
    }, [currentUser, router])

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/crm/users')
            const data = await res.json()
            setUsers(data.data || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadUsers() }, [])

    const openCreate = () => {
        setEditUser(null)
        setForm({ name: '', email: '', password: '', role: 'agent' })
        setError('')
        setShowModal(true)
    }

    const openEdit = (u: UserItem) => {
        setEditUser(u)
        setForm({ name: u.name, email: u.email, password: '', role: u.role })
        setError('')
        setShowModal(true)
    }

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const url = editUser ? `/api/crm/users/${editUser.id}` : '/api/crm/users'
            const method = editUser ? 'PATCH' : 'POST'
            const body = editUser
                ? { name: form.name, email: form.email, role: form.role, ...(form.password ? { password: form.password } : {}) }
                : form

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erro ao salvar')
                return
            }

            setShowModal(false)
            loadUsers()
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este usuário?')) return

        const res = await fetch(`/api/crm/users/${id}`, { method: 'DELETE' })
        if (res.ok) loadUsers()
    }

    if (loading) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-gold" />
                        Atendentes
                    </h1>
                    <p className="text-platinum mt-1">Gerencie usuários e atendentes do CRM</p>
                </div>
                <button
                    onClick={openCreate}
                    disabled={!canEdit}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                    Novo Atendente
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-charcoal rounded-2xl border border-white/10 overflow-hidden"
            >
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse h-14 bg-white/5 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left px-6 py-4 text-platinum text-sm font-medium">Usuário</th>
                                <th className="text-left px-6 py-4 text-platinum text-sm font-medium">Função</th>
                                <th className="text-left px-6 py-4 text-platinum text-sm font-medium">Criado em</th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <motion.tr
                                    key={u.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-gold font-medium text-sm">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{u.name}</p>
                                                <p className="text-platinum text-sm">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            'px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 w-fit',
                                            roleColors[u.role] || 'bg-white/10 text-platinum border-white/10'
                                        )}>
                                            {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {roleLabels[u.role] || u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-platinum text-sm">
                                        {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(u)}
                                                className="p-2 rounded-lg text-platinum hover:text-gold hover:bg-gold/10 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {u.id !== currentUser?.id && (
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="p-2 rounded-lg text-platinum hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-charcoal rounded-2xl p-6 border border-white/10 w-full max-w-md md:max-w-xl lg:max-w-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {editUser ? 'Editar Usuário' : 'Novo Atendente'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-platinum hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-platinum text-sm mb-1">Nome</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50"
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div>
                                <label className="block text-platinum text-sm mb-1">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50"
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-platinum text-sm mb-1">
                                    Senha {editUser && <span className="text-platinum/50">(deixe em branco para manter)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50"
                                    placeholder={editUser ? '••••••' : 'Mínimo 6 caracteres'}
                                />
                            </div>
                            <div>
                                <label className="block text-platinum text-sm mb-1">Função</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    disabled={currentUser?.role === 'gestor'}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {currentUser?.role === 'gestor' ? (
                                        <option value="agent">Atendente</option>
                                    ) : (
                                        <>
                                            <option value="agent">Atendente</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Administrador</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm">{error}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-platinum hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
