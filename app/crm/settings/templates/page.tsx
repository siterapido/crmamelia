'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface QuickReply {
    id: string
    title: string
    shortcut: string
    content: string
    category: string | null
    createdAt: string
}

const categoryLabels: Record<string, string> = {
    saudacao: 'Saudação',
    geral: 'Geral',
    handoff: 'Transferência',
    vendas: 'Vendas',
    encerramento: 'Encerramento',
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<QuickReply[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editItem, setEditItem] = useState<QuickReply | null>(null)
    const [form, setForm] = useState({ title: '', shortcut: '/', content: '', category: 'geral' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const loadTemplates = async () => {
        try {
            const res = await fetch('/api/crm/quick-replies')
            const data = await res.json()
            setTemplates(data.data || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadTemplates() }, [])

    const openCreate = () => {
        setEditItem(null)
        setForm({ title: '', shortcut: '/', content: '', category: 'geral' })
        setError('')
        setShowModal(true)
    }

    const openEdit = (item: QuickReply) => {
        setEditItem(item)
        setForm({ title: item.title, shortcut: item.shortcut, content: item.content, category: item.category || 'geral' })
        setError('')
        setShowModal(true)
    }

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const url = editItem ? `/api/crm/quick-replies/${editItem.id}` : '/api/crm/quick-replies'
            const method = editItem ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erro ao salvar')
                return
            }

            setShowModal(false)
            loadTemplates()
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Deletar este template?')) return
        const res = await fetch(`/api/crm/quick-replies/${id}`, { method: 'DELETE' })
        if (res.ok) loadTemplates()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Zap className="w-8 h-8 text-gold" />
                        Respostas Rápidas
                    </h1>
                    <p className="text-platinum mt-1">Templates para agilizar o atendimento. Digite <code className="text-gold bg-gold/10 px-1 rounded">/</code> no chat para usar.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Novo Template
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse h-24 bg-white/5 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {templates.map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-charcoal rounded-2xl p-5 border border-white/10 flex items-start gap-4"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <code className="text-gold bg-gold/10 px-2.5 py-1 rounded-lg text-sm font-mono font-bold">
                                        {t.shortcut}
                                    </code>
                                    <span className="text-white font-medium">{t.title}</span>
                                    {t.category && (
                                        <span className="text-platinum/50 text-xs bg-white/5 px-2 py-0.5 rounded">
                                            {categoryLabels[t.category] || t.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-platinum text-sm line-clamp-2">{t.content}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => openEdit(t)}
                                    className="p-2 rounded-lg text-platinum hover:text-gold hover:bg-gold/10 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="p-2 rounded-lg text-platinum hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {templates.length === 0 && (
                        <div className="text-center py-16">
                            <Zap className="w-12 h-12 text-platinum/30 mx-auto mb-4" />
                            <p className="text-platinum">Nenhum template ainda</p>
                            <p className="text-platinum/50 text-sm mt-1">Crie templates para agilizar o atendimento</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-charcoal rounded-2xl p-6 border border-white/10 w-full max-w-lg md:max-w-2xl lg:max-w-3xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {editItem ? 'Editar Template' : 'Novo Template'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-platinum hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-platinum text-sm mb-1">Título</label>
                                    <input
                                        value={form.title}
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50"
                                        placeholder="Ex: Saudação"
                                    />
                                </div>
                                <div>
                                    <label className="block text-platinum text-sm mb-1">Atalho</label>
                                    <input
                                        value={form.shortcut}
                                        onChange={e => setForm(f => ({ ...f, shortcut: e.target.value.startsWith('/') ? e.target.value : `/${e.target.value}` }))}
                                        className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50 font-mono"
                                        placeholder="/oi"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-platinum text-sm mb-1">Categoria</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50"
                                >
                                    <option value="geral">Geral</option>
                                    <option value="saudacao">Saudação</option>
                                    <option value="vendas">Vendas</option>
                                    <option value="handoff">Transferência</option>
                                    <option value="encerramento">Encerramento</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-platinum text-sm mb-1">Conteúdo</label>
                                <textarea
                                    value={form.content}
                                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-gold/50 resize-none"
                                    placeholder="Texto da mensagem..."
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

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
