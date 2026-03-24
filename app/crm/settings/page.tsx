'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Lock, LogOut, Users, ChevronRight,
    Check, Eye, EyeOff, Zap, Shield,
    MessageSquare, Sparkles, AlertCircle, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { ROLE_LABELS } from '@/lib/auth/rbac'

const roleColors: Record<string, string> = {
    admin: 'bg-gold/10 text-gold border-gold/20',
    gestor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    vendedor: 'bg-green-500/10 text-green-400 border-green-500/20',
    produtor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function CRMSettingsPage() {
    const { user, logout, checkAuth } = useAuth()
    const router = useRouter()

    // Profile edit state
    const [editingName, setEditingName] = useState(false)
    const [name, setName] = useState(user?.name || '')
    const [nameSaving, setNameSaving] = useState(false)
    const [nameSuccess, setNameSuccess] = useState(false)
    const [nameError, setNameError] = useState('')

    // Password state
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [pwSaving, setPwSaving] = useState(false)
    const [pwSuccess, setPwSuccess] = useState(false)
    const [pwError, setPwError] = useState('')

    // Logout state
    const [loggingOut, setLoggingOut] = useState(false)

    const isAdmin = user?.role === 'admin'
    const isGestor = user?.role === 'gestor' || isAdmin

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
                <h1 className="text-2xl font-bold text-white">Configurações</h1>
                <p className="text-platinum/60 text-sm mt-0.5">Gerencie sua conta e preferências</p>
            </div>

            {/* Meu Perfil */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-charcoal rounded-2xl border border-white/10 overflow-hidden"
            >
                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
                    <User className="w-4 h-4 text-platinum/50" />
                    <h2 className="text-white font-semibold">Meu Perfil</h2>
                </div>

                <div className="p-6 space-y-5">
                    {/* Avatar + role */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-gold font-bold text-xl">{initials}</span>
                        </div>
                        <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-platinum/60 text-sm">{user.email}</p>
                            <span className={cn(
                                'inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-xs font-medium border',
                                roleColors[user.role] || 'bg-white/10 text-platinum border-white/10'
                            )}>
                                {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                            </span>
                        </div>
                    </div>

                    {/* Name field */}
                    <div>
                        <label className="block text-platinum/70 text-xs font-medium mb-1.5 uppercase tracking-wide">
                            Nome de exibição
                        </label>
                        {editingName ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setName(user.name) } }}
                                    className="flex-1 px-4 py-2.5 bg-white/5 rounded-xl border border-gold/40 text-white focus:outline-none text-sm"
                                />
                                <button
                                    onClick={handleSaveName}
                                    disabled={nameSaving}
                                    className="px-4 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                                >
                                    {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                                </button>
                                <button
                                    onClick={() => { setEditingName(false); setName(user.name) }}
                                    className="px-4 py-2.5 bg-white/5 rounded-xl border border-white/10 text-platinum hover:bg-white/10 transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 rounded-xl border border-white/10">
                                <span className="text-white text-sm">{user.name}</span>
                                <button
                                    onClick={() => { setEditingName(true); setName(user.name) }}
                                    className="text-platinum/50 hover:text-gold text-xs transition-colors"
                                >
                                    Editar
                                </button>
                            </div>
                        )}
                        {nameError && (
                            <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> {nameError}
                            </p>
                        )}
                        {nameSuccess && (
                            <p className="flex items-center gap-1.5 text-green-400 text-xs mt-1.5">
                                <Check className="w-3.5 h-3.5" /> Nome atualizado com sucesso
                            </p>
                        )}
                    </div>

                    {/* Email (readonly) */}
                    <div>
                        <label className="block text-platinum/70 text-xs font-medium mb-1.5 uppercase tracking-wide">
                            Email
                        </label>
                        <div className="px-4 py-2.5 bg-white/[0.03] rounded-xl border border-white/5">
                            <span className="text-platinum/60 text-sm">{user.email}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Segurança */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-charcoal rounded-2xl border border-white/10 overflow-hidden"
            >
                <button
                    onClick={() => { setShowPasswordForm(v => !v); setPwError(''); setPwForm({ current: '', new: '', confirm: '' }) }}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-platinum/50" />
                        <div className="text-left">
                            <p className="text-white font-semibold">Alterar Senha</p>
                            {pwSuccess && (
                                <p className="text-green-400 text-xs flex items-center gap-1 mt-0.5">
                                    <Check className="w-3 h-3" /> Senha alterada com sucesso
                                </p>
                            )}
                        </div>
                    </div>
                    <ChevronRight className={cn(
                        'w-4 h-4 text-platinum/40 transition-transform',
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
                            <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-5">
                                {/* Current password */}
                                <div>
                                    <label className="block text-platinum/70 text-xs font-medium mb-1.5">Senha atual</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            value={pwForm.current}
                                            onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                                            className="w-full px-4 py-2.5 pr-10 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/40 text-sm"
                                            placeholder="••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-platinum/40 hover:text-platinum"
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New password */}
                                <div>
                                    <label className="block text-platinum/70 text-xs font-medium mb-1.5">Nova senha</label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={pwForm.new}
                                            onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))}
                                            className="w-full px-4 py-2.5 pr-10 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/40 text-sm"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-platinum/40 hover:text-platinum"
                                        >
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm */}
                                <div>
                                    <label className="block text-platinum/70 text-xs font-medium mb-1.5">Confirmar nova senha</label>
                                    <input
                                        type="password"
                                        value={pwForm.confirm}
                                        onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                                        onKeyDown={e => { if (e.key === 'Enter') handleChangePassword() }}
                                        className={cn(
                                            'w-full px-4 py-2.5 bg-white/5 rounded-xl border text-white focus:outline-none focus:border-gold/40 text-sm',
                                            pwForm.confirm && pwForm.new !== pwForm.confirm
                                                ? 'border-red-500/50'
                                                : 'border-white/10'
                                        )}
                                        placeholder="••••••"
                                    />
                                </div>

                                {pwError && (
                                    <p className="flex items-center gap-1.5 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
                                    </p>
                                )}

                                <button
                                    onClick={handleChangePassword}
                                    disabled={pwSaving}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                                >
                                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    {pwSaving ? 'Salvando...' : 'Alterar senha'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Ferramentas de atendimento */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-charcoal rounded-2xl border border-white/10 overflow-hidden"
            >
                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-platinum/50" />
                    <h2 className="text-white font-semibold">Atendimento</h2>
                </div>

                <Link
                    href="/crm/settings/templates"
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-gold" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Respostas Rápidas</p>
                            <p className="text-platinum/50 text-xs">Templates com atalhos <code className="text-gold/70">/</code> no chat</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-platinum/30 group-hover:text-platinum/60 transition-colors" />
                </Link>
            </motion.div>

            {/* Administração (admin/gestor only) */}
            {isGestor && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-charcoal rounded-2xl border border-white/10 overflow-hidden"
                >
                    <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-platinum/50" />
                        <h2 className="text-white font-semibold">Administração</h2>
                    </div>



                    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">WhatsApp</p>
                            <p className="text-platinum/50 text-xs">Evolution API · sixosaudeficial</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Conectado
                        </span>
                    </div>

                    <div className="flex items-center gap-3 px-6 py-4">
                        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-gold" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">Agente IA SDR</p>
                            <p className="text-platinum/50 text-xs">Gemini 2.5 Flash · Qualificação automática</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                            Ativo
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Sair */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all text-sm font-medium disabled:opacity-50"
                >
                    {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {loggingOut ? 'Saindo...' : 'Sair da conta'}
                </button>
            </motion.div>
        </div>
    )
}
