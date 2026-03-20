'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Settings, MessageSquare, Sparkles, CheckCircle, XCircle, Copy, Wifi, WifiOff, QrCode, RefreshCw, LogOut } from 'lucide-react'
import Link from 'next/link'

interface QRStatus {
    connected: boolean
    status: string
    qrCode?: string | null
    phone?: string | null
    profilePicture?: string | null
    error?: string
}

export default function CRMSettingsPage() {
    const [qrStatus, setQrStatus] = useState<QRStatus | null>(null)
    const [loadingQr, setLoadingQr] = useState(true)
    const [disconnecting, setDisconnecting] = useState(false)
    const [copied, setCopied] = useState(false)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const webhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/whatsapp/webhook`
        : '/api/whatsapp/webhook'

    const fetchQRStatus = async () => {
        try {
            const res = await fetch('/api/crm/whatsapp/qrcode')
            const data = await res.json()
            setQrStatus(data)
            return data
        } catch {
            setQrStatus({ connected: false, status: 'error', error: 'Erro ao verificar status' })
            return null
        } finally {
            setLoadingQr(false)
        }
    }

    useEffect(() => {
        fetchQRStatus()
    }, [])

    // Polling: 3s when disconnected (waiting for QR scan), 30s when connected
    useEffect(() => {
        if (pollingRef.current) clearInterval(pollingRef.current)

        const interval = qrStatus?.connected ? 30000 : 3000

        pollingRef.current = setInterval(async () => {
            const data = await fetchQRStatus()
            // Stop fast polling once connected
            if (data?.connected && pollingRef.current) {
                clearInterval(pollingRef.current)
                pollingRef.current = setInterval(fetchQRStatus, 30000)
            }
        }, interval)

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [qrStatus?.connected])

    const handleDisconnect = async () => {
        if (!confirm('Desconectar o WhatsApp desta instância?')) return
        setDisconnecting(true)
        try {
            await fetch('/api/crm/whatsapp/qrcode', { method: 'DELETE' })
            await fetchQRStatus()
        } finally {
            setDisconnecting(false)
        }
    }

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

            {/* WhatsApp Connection Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-charcoal rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    {qrStatus?.connected ? (
                        <Wifi className="w-5 h-5 text-green-400" />
                    ) : (
                        <WifiOff className="w-5 h-5 text-red-400" />
                    )}
                    Conexão WhatsApp
                </h2>

                {loadingQr ? (
                    <div className="flex items-center gap-3 text-platinum">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Verificando conexão...
                    </div>
                ) : qrStatus?.connected ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-green-400 font-semibold">Conectado</span>
                            {qrStatus.phone && (
                                <span className="text-platinum text-sm">({qrStatus.phone})</span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={fetchQRStatus}
                                className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-platinum hover:bg-white/10 hover:text-white transition-colors text-sm flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Atualizar
                            </button>
                            <button
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                className="px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                <LogOut className="w-4 h-4" />
                                {disconnecting ? 'Desconectando...' : 'Desconectar'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <span className="text-red-400 font-medium">Desconectado</span>
                            <span className="text-platinum/50 text-sm">
                                {qrStatus?.status === 'close' ? '— escaneie o QR Code abaixo' : `(${qrStatus?.status || 'verificando...'})`}
                            </span>
                        </div>

                        {qrStatus?.qrCode ? (
                            <div className="space-y-3">
                                <div className="bg-white rounded-2xl p-5 inline-block">
                                    <div className="flex items-center gap-2 mb-3">
                                        <QrCode className="w-5 h-5 text-gray-600" />
                                        <span className="text-gray-700 font-medium text-sm">Escaneie com o WhatsApp</span>
                                    </div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`data:image/png;base64,${qrStatus.qrCode}`}
                                        alt="QR Code WhatsApp"
                                        className="w-64 h-64"
                                    />
                                </div>
                                <p className="text-platinum/50 text-sm flex items-center gap-2">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    Atualizando automaticamente a cada 3 segundos...
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-platinum text-sm">
                                    Nenhum QR code disponível. Clique em Atualizar ou verifique se a Evolution API está rodando.
                                </p>
                                <button
                                    onClick={fetchQRStatus}
                                    className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-platinum hover:bg-white/10 hover:text-white transition-colors text-sm flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Tentar novamente
                                </button>
                            </div>
                        )}

                        {qrStatus?.error && (
                            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                <p className="text-red-400 text-sm">{qrStatus.error}</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

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
