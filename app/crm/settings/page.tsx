'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, MessageSquare, Sparkles, CheckCircle, Copy } from 'lucide-react'
import Link from 'next/link'

export default function CRMSettingsPage() {
    const [copied, setCopied] = useState(false)

    const webhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/whatsapp/webhook`
        : '/api/whatsapp/webhook'

    const copyWebhookUrl = () => {
        navigator.clipboard.writeText(webhookUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold text-white">Configurações CRM</h1>
                <p className="text-platinum mt-1">WhatsApp via Evolution API · Agente IA SDR</p>
            </div>

            {/* Webhook URL */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-charcoal rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    Webhook Evolution API
                </h2>
                <div>
                    <label className="block text-platinum text-sm mb-1">URL do Webhook</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={webhookUrl}
                            className="flex-1 px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-platinum text-sm font-mono"
                        />
                        <button
                            onClick={copyWebhookUrl}
                            className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-platinum hover:bg-white/10 hover:text-white transition-colors"
                        >
                            {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-platinum/50 text-xs mt-2">
                        Configure esta URL no painel Evolution API como webhook para os eventos MESSAGES_UPSERT e MESSAGES_UPDATE
                    </p>
                </div>
            </motion.div>

            {/* AI Agent Config */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-charcoal rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-gold" />
                    Agente IA SDR
                </h2>

                <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h3 className="text-white font-medium text-sm mb-2">Comportamento do Agente</h3>
                        <ul className="text-platinum text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-gold mt-1">1.</span>
                                <span><strong>Qualifica</strong> leads coletando nome, cidade e número de vidas</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gold mt-1">2.</span>
                                <span><strong>Aplica</strong> metodologia SPIN Selling para entender necessidades</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gold mt-1">3.</span>
                                <span><strong>Transfere</strong> para humano quando necessário (preços, reclamações, proposta)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gold mt-1">4.</span>
                                <span><strong>Agenda</strong> follow-ups automáticos</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <label className="block text-platinum text-sm mb-1">Modelo IA</label>
                        <p className="text-white text-sm bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                            Google Gemini 2.5 Flash (via OpenRouter)
                        </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h3 className="text-white font-medium text-sm mb-2">Triggers de Handoff</h3>
                        <ul className="text-platinum text-sm space-y-1">
                            <li>• Contato pede explicitamente por humano</li>
                            <li>• Negociação detalhada de preços/contratos</li>
                            <li>• Reclamações ou cancelamentos</li>
                            <li>• Lead qualificado pronto para proposta</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-charcoal rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-gold" />
                    Configurações Avançadas
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/crm/settings/users"
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/20 transition-all"
                    >
                        <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                            <span className="text-gold text-lg">👥</span>
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Atendentes</p>
                            <p className="text-platinum text-xs">Gerenciar usuários</p>
                        </div>
                    </Link>
                    <Link
                        href="/crm/settings/templates"
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/20 transition-all"
                    >
                        <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                            <span className="text-gold text-lg">⚡</span>
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Templates</p>
                            <p className="text-platinum text-xs">Respostas rápidas</p>
                        </div>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

function EnvVar({ name, desc }: { name: string; desc: string }) {
    return (
        <div className="flex items-center gap-3 py-1">
            <code className="text-gold bg-gold/10 px-2 py-0.5 rounded">{name}</code>
            <span className="text-platinum/70">{desc}</span>
        </div>
    )
}
