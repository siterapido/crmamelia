'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Sparkles, CheckCircle, XCircle, Copy, ExternalLink, Loader2 } from 'lucide-react'

const PRODUCTION_WEBHOOK_URL = 'https://crmamelia.vercel.app/api/whatsapp/webhook'
const EVOLUTION_MANAGER_URL = 'https://api.odontogpt.com/manager'

export default function IntegrationsSettingsPage() {
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const [whatsappStatus, setWhatsappStatus] = useState<{ connected?: boolean; status?: string } | null>(null)

    const webhookUrl =
        typeof window !== 'undefined' && window.location.hostname === 'crmamelia.vercel.app'
            ? PRODUCTION_WEBHOOK_URL
            : typeof window !== 'undefined'
              ? `${window.location.origin}/api/whatsapp/webhook`
              : PRODUCTION_WEBHOOK_URL

    useEffect(() => {
        fetch('/api/crm/whatsapp/test', { credentials: 'include' })
            .then(r => r.json())
            .then(setWhatsappStatus)
            .catch(() => setWhatsappStatus({ connected: false }))
    }, [])

    const handleTestConnection = async () => {
        setTesting(true)
        setTestResult(null)
        try {
            const res = await fetch('/api/crm/whatsapp/test', { method: 'POST', credentials: 'include' })
            const data = await res.json()
            setTestResult({
                success: data.success,
                message: data.success
                    ? `Conectado! Estado: ${data.status || 'open'}`
                    : data.error || 'Falha na conexão',
            })
            setWhatsappStatus({ connected: data.success, status: data.status })
        } catch {
            setTestResult({ success: false, message: 'Erro ao testar conexão' })
        } finally {
            setTesting(false)
        }
    }

    const copyWebhookUrl = () => {
        navigator.clipboard.writeText(webhookUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const whatsappConnected = whatsappStatus?.connected ?? testResult?.success

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-[var(--crm-text)]">Integrações</h1>
                <p className="text-[var(--crm-text-muted)] text-sm mt-0.5">WhatsApp e Agente IA SDR</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-[var(--crm-surface)] rounded-xl border border-[var(--crm-border)]">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[var(--crm-text)] text-sm font-medium">WhatsApp</p>
                        <p className="text-[var(--crm-text-muted)] text-xs truncate">Evolution API · amelia1</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${
                        whatsappConnected
                            ? 'text-green-600 bg-green-500/10 border-green-500/20'
                            : 'text-[var(--crm-text-muted)] bg-[var(--crm-surface-2)] border-[var(--crm-border)]'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${whatsappConnected ? 'bg-green-500 animate-pulse' : 'bg-[var(--crm-text-muted)]'}`} />
                        {whatsappConnected ? 'Conectado' : 'Verificando...'}
                    </span>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[var(--crm-surface)] rounded-xl border border-[var(--crm-border)]">
                    <div className="w-10 h-10 rounded-lg bg-[var(--crm-accent-bg)] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[var(--crm-accent)]" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[var(--crm-text)] text-sm font-medium">Agente IA SDR</p>
                        <p className="text-[var(--crm-text-muted)] text-xs">Kimi K2.6 · Qualificação automática</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-[var(--crm-accent)] bg-[var(--crm-accent-bg)] px-2.5 py-1 rounded-full border border-[var(--crm-border)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--crm-accent)]" />
                        Ativo
                    </span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--crm-surface)] rounded-2xl p-6 border border-[var(--crm-border)]"
            >
                <h2 className="text-lg font-semibold text-[var(--crm-text)] flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Evolution API · Instância amelia1
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[var(--crm-text-muted)] text-sm mb-1">Webhook URL (produção)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={webhookUrl}
                                className="flex-1 px-4 py-3 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)] text-[var(--crm-text-muted)] text-sm font-mono"
                            />
                            <button
                                onClick={copyWebhookUrl}
                                className="px-4 py-3 bg-[var(--crm-surface-2)] rounded-xl border border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface)] transition-colors"
                            >
                                {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={handleTestConnection}
                            disabled={testing}
                            className="px-5 py-2.5 bg-[var(--crm-accent)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {testing ? 'Testando...' : 'Testar Conexão Evolution'}
                        </button>

                        {testResult && (
                            <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-600' : 'text-red-500'}`}>
                                {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {testResult.message}
                            </div>
                        )}
                    </div>

                    <a
                        href={EVOLUTION_MANAGER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[var(--crm-accent)] text-sm hover:underline"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Abrir Evolution Manager
                    </a>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--crm-surface)] rounded-2xl p-6 border border-[var(--crm-border)]"
            >
                <h2 className="text-lg font-semibold text-[var(--crm-text)] flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[var(--crm-accent)]" />
                    Agente IA SDR
                </h2>
                <ul className="text-[var(--crm-text-muted)] text-sm space-y-2">
                    <li>Acolhe e qualifica leads via WhatsApp</li>
                    <li>Educa sobre planos e operadoras parceiras</li>
                    <li>Transfere para consultor humano quando necessário</li>
                    <li>Agenda follow-ups automáticos</li>
                </ul>
            </motion.div>
        </div>
    )
}
