'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, MoreVertical, Pencil, Trash2, Loader2, X, Mail, User, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { ROLE_LABELS, ALL_ROLES, UserRole } from '@/lib/auth/rbac'

interface User {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string
    createdAt: string
}

export default function UsersPage() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
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
            const res = await fetch('/api/crm/users')
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
            const res = await fetch(`/api/crm/users/${id}`, { method: 'DELETE' })
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

    const openEditModal = (user: User) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role as UserRole,
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'vendedor',
        })
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-500/10 text-red-400 border-red-500/20'
            case 'gestor':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'produtor':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            default:
                return 'bg-green-500/10 text-green-400 border-green-500/20'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Usuários</h1>
                    <p className="text-platinum mt-1">Gerencie usuários do sistema</p>
                </div>
                <button
                    onClick={() => {
                        resetForm()
                        setEditingUser(null)
                        setShowModal(true)
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Novo Usuário
                </button>
            </div>

            <div className="bg-charcoal rounded-2xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                        <input
                            type="text"
                            placeholder="Buscar usuários..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gold animate-spin" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <User className="w-12 h-12 text-platinum/50 mx-auto mb-3" />
                        <p className="text-platinum">Nenhum usuário encontrado</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-platinum font-medium">Usuário</th>
                                    <th className="text-left p-4 text-platinum font-medium">Email</th>
                                    <th className="text-left p-4 text-platinum font-medium">Função</th>
                                    <th className="text-left p-4 text-platinum font-medium">Criado em</th>
                                    <th className="text-right p-4 text-platinum font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gold" />
                                                </div>
                                                <span className="text-white font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-platinum">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                {ROLE_LABELS[user.role as UserRole] || user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-platinum">
                                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-platinum hover:text-gold transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {user.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-platinum hover:text-red-400 transition-colors"
                                                    >
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
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-charcoal rounded-2xl p-6 w-full max-w-md border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-platinum hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-platinum mb-2">
                                        Nome
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-platinum mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-platinum mb-2">
                                        {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingUser}
                                            minLength={6}
                                            className="w-full pl-12 pr-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-platinum mb-2">
                                        Função
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                                    >
                                        {ALL_ROLES.map((role) => (
                                            <option key={role} value={role}>
                                                {ROLE_LABELS[role]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 px-4 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-3 px-4 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                                    >
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
