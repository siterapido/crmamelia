'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Lock, LogOut, ChevronRight,
    Check, Eye, EyeOff, Shield, AlertCircle, Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { ROLE_LABELS } from '@/lib/auth/rbac'

const roleColors: Record<string, string> = {
    admin: 'bg-[var(--crm-accent-bg)] text-[var(--crm-accent)] border-[var(--crm-border)]',
    gestor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    vendedor: 'bg-green-500/10 text-green-600 border-green-500/20',
    produtor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
}

export default function ProfileSettingsPage() {
    const { user, logout, checkAuth } = useAuth()
    const router = useRouter()

    const [editingName, setEditingName] = useState(false)
    const [name, setName] = useState(user?.name || '')
    const [nameSaving, setNameSaving] = useState(false)
    const [nameSuccess, setNameSuccess] = useState(false)
    const [nameError, setNameError] = useState('')

    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [pwSaving, setPwSaving] = useState(false)
    const [pwSuccess, setPwSuccess] = useState(false)
    const [pwError, setPwError] = useState('')

    const [loggingOut, setLoggingOut] = useState(false)

    const handleSaveName = async () => {
        if (!name.trim() || name.trim() === user?.name) {
            setEditingName(false)
            return
        }
        setNameSaving(true)
        setNameError('')
        try {
            const res = await fetch('/api/crm/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) {
                setNameError(data.error || 'Erro ao salvar')
                return
            }
            await checkAuth()
            setNameSuccess(true)
            setEditingName(false)
            setTimeout(() => setNameSuccess(false), 3000)
        } finally {
            setNameSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (!pwForm.current || !pwForm.new || !pwForm.confirm) {
            setPwError('Preencha todos os campos')
            return
        }
        if (pwForm.new !== pwForm.confirm) {
            setPwError('As senhas não coincidem')
            return
        }
        if (pwForm.new.length < 6) {
            setPwError('Nova senha deve ter pelo menos 6 caracteres')
            return
        }
        setPwSaving(true)
        setPwError('')
        try {
            const res = await fetch('/api/crm/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) {
                setPwError(data.error || 'Erro ao alterar senha')
                return
            }
            setPwSuccess(true)
            setShowPasswordForm(false)
            setPwForm({ current: '', new: '', confirm: '' })
            setTimeout(() => setPwSuccess(false), 3000)
        } finally {
            setPwSaving(false)
        }
    }

    const handleLogout = async () => {
        setLoggingOut(true)
        await logout()
        router.push('/admin/login')
    }

    if (!user) return null

    const initials = user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-[var(--crm-text)]">Perfil</h1>
                <p className="text-[var(--crm-text-muted)] text-sm mt-0.5">Gerencie sua conta e preferências</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--crm-surface)] rounded-2xl border border-[var(--crm-border)] overflow-hidden"
            >
                <div className="px-6 py-5 border-b border-[var(--crm-border)] flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--crm-text-muted)]" />
                    <h2 className="text-[var(--crm-text)] font-semibold">Meu Perfil</h2>
                </div>

                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--crm-accent-bg)] flex items-center justify-center flex-shrink-0">
                            <span className="text-[var(--crm-accent)] font-bold text-xl">{initials}</span>
                        </div>
                        <div>
                            <p className="text-[var(--crm-text)] font-medium">{user.name}</p>
                            <p className="text-[var(--crm-text-muted)] text-sm">{user.email}</p>
                            <span className={cn(
                                'inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-xs font-medium border',
                                roleColors[user.role] || 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)] border-[var(--crm-border)]'
                            )}>
                                {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[var(--crm-text-muted)] text-xs font-medium mb-1.5 uppercase tracking-wide">
                            Nome de exibição
                        </label>
                        {editingName ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setName(user.name) } }}
                                    className="flex-1 px-4 py-2.5 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-accent)]/40 text-[var(--crm-text)] focus:outline-none text-sm"
                                />
                                <button
                                    onClick={handleSaveName}
                                    disabled={nameSaving}
                                    className="px-4 py-2.5 bg-[var(--crm-accent)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                                >
                                    {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                                </button>
                                <button
                                    onClick={() => { setEditingName(false); setName(user.name) }}
                                    className="px-4 py-2.5 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface)] transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)]">
                                <span className="text-[var(--crm-text)] text-sm">{user.name}</span>
                                <button
                                    onClick={() => { setEditingName(true); setName(user.name) }}
                                    className="text-[var(--crm-text-muted)] hover:text-[var(--crm-accent)] text-xs transition-colors"
                                >
                                    Editar
                                </button>
                            </div>
                        )}
                        {nameError && (
                            <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> {nameError}
                            </p>
                        )}
                        {nameSuccess && (
                            <p className="flex items-center gap-1.5 text-green-600 text-xs mt-1.5">
                                <Check className="w-3.5 h-3.5" /> Nome atualizado com sucesso
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[var(--crm-text-muted)] text-xs font-medium mb-1.5 uppercase tracking-wide">
                            Email
                        </label>
                        <div className="px-4 py-2.5 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)]">
                            <span className="text-[var(--crm-text-muted)] text-sm">{user.email}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-[var(--crm-surface)] rounded-2xl border border-[var(--crm-border)] overflow-hidden"
            >
                <button
                    onClick={() => { setShowPasswordForm(v => !v); setPwError(''); setPwForm({ current: '', new: '', confirm: '' }) }}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-[var(--crm-surface-2)] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-[var(--crm-text-muted)]" />
                        <div className="text-left">
                            <p className="text-[var(--crm-text)] font-semibold">Alterar Senha</p>
                            {pwSuccess && (
                                <p className="text-green-600 text-xs flex items-center gap-1 mt-0.5">
                                    <Check className="w-3 h-3" /> Senha alterada com sucesso
                                </p>
                            )}
                        </div>
                    </div>
                    <ChevronRight className={cn(
                        'w-4 h-4 text-[var(--crm-text-muted)] transition-transform',
                        showPasswordForm && 'rotate-90'
                    )} />
                </button>

                <AnimatePresence>
                    {showPasswordForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-6 space-y-4 border-t border-[var(--crm-border)] pt-5">
                                <div>
                                    <label className="block text-[var(--crm-text-muted)] text-xs font-medium mb-1.5">Senha atual</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            value={pwForm.current}
                                            onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                                            className="w-full px-4 py-2.5 pr-10 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)] text-[var(--crm-text)] focus:outline-none focus:border-[var(--crm-accent)]/40 text-sm"
                                            placeholder="••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[var(--crm-text-muted)] text-xs font-medium mb-1.5">Nova senha</label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={pwForm.new}
                                            onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))}
                                            className="w-full px-4 py-2.5 pr-10 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)] text-[var(--crm-text)] focus:outline-none focus:border-[var(--crm-accent)]/40 text-sm"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"
                                        >
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[var(--crm-text-muted)] text-xs font-medium mb-1.5">Confirmar nova senha</label>
                                    <input
                                        type="password"
                                        value={pwForm.confirm}
                                        onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                                        onKeyDown={e => { if (e.key === 'Enter') handleChangePassword() }}
                                        className={cn(
                                            'w-full px-4 py-2.5 bg-[var(--crm-surface-2)] rounded-xl border text-[var(--crm-text)] focus:outline-none focus:border-[var(--crm-accent)]/40 text-sm',
                                            pwForm.confirm && pwForm.new !== pwForm.confirm
                                                ? 'border-red-500/50'
                                                : 'border-[var(--crm-border)]'
                                        )}
                                        placeholder="••••••"
                                    />
                                </div>

                                {pwError && (
                                    <p className="flex items-center gap-1.5 text-red-500 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
                                    </p>
                                )}

                                <button
                                    onClick={handleChangePassword}
                                    disabled={pwSaving}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--crm-accent)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                                >
                                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    {pwSaving ? 'Salvando...' : 'Alterar senha'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-500/40 transition-all text-sm font-medium disabled:opacity-50"
                >
                    {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {loggingOut ? 'Saindo...' : 'Sair da conta'}
                </button>
            </motion.div>
        </div>
    )
}
