'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, MessageSquare, Sparkles, CheckCircle, XCircle, Copy, ExternalLink, Wifi, WifiOff, QrCode, RefreshCw } from 'lucide-react'

interface ConnectionStatus {
    connected: boolean
    smartphoneConnected?: boolean
    phone?: string
    qrCode?: string | null
    error?: string
}

export default function CRMSettingsPage() {
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const [status, setStatus] = useState<ConnectionStatus | null>(null)
    const [loadingStatus, setLoadingStatus] = useState(true)

    const webhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/whatsapp/webhook`
        : '/api/whatsapp/webhook'

    const fetchStatus = async () => {
        setLoadingStatus(true)
        try {
            const res = await fetch('/api/crm/whatsapp/test')
            const data = await res.json()
            setStatus(data)
        } catch {
            setStatus({ connected: false, error: 'Erro ao verificar status' })
        } finally {
            setLoadingStatus(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    const handleTestConnection = async () => {
        setTesting(true)
        setTestResult(null)
        try {
            const res = await fetch('/api/crm/whatsapp/test', { method: 'POST' })
            const data = await res.json()
            setTestResult({
                success: data.success,
                message: data.success
                    ? `Conectado! Numero: ${data.phone}`
                    : data.error || 'Falha na conexao',
            })
            if (data.success) {
                setStatus({ connected: true, phone: data.phone })
            }
        } catch {
            setTestResult({ success: false, message: 'Erro ao testar conexao' })
        } finally {
            setTesting(false)
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
                <h1 className="text-3xl font-bold text-white">Configuracoes CRM</h1>
                <p className="text-platinum mt-1">Z-API WhatsApp e Agente IA SDR</p>
            </div>

            {/* Connection Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-charcoal rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    {status?.connected ? (
                        <Wifi className="w-5 h-5 text-green-400" />
                    ) : (
                        <WifiOff className="w-5 h-5 text-red-400" />
                    )}
                    Status da Conexao WhatsApp
                </h2>

                {loadingStatus ? (
                    <div className="flex items-center gap-3 text-platinum">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Verificando conexao...
                    </div>
                ) : status?.connected ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-green-400 font-medium">Conectado</span>
                            {status.phone && (
                                <span className="text-platinum text-sm">({status.phone})</span>
                            )}
                        </div>
                        <button
                            onClick={fetchStatus}
                            className="text-platinum text-sm hover:text-white flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Atualizar status
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <span className="text-red-400 font-medium">Desconectado</span>
                        </div>

                        {status?.qrCode && (
                            <div className="bg-white rounded-xl p-4 inline-block">
                                <div className="flex items-center gap-2 mb-3">
                                    <QrCode className="w-5 h-5 text-gray-600" />
                                    <span className="text-gray-700 font-medium text-sm">Escaneie com o WhatsApp</span>
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`data:image/png;base64,${status.qrCode}`}
                                    alt="QR Code WhatsApp"
                                    className="w-64 h-64"
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={fetchStatus}
                                className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-platinum hover:bg-white/10 hover:text-white transition-colors text-sm flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Atualizar QR Code
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Z-API Configuration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-charcoal rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    Z-API WhatsApp
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-platinum text-sm mb-1">Webhook URL (ReceivedCallback)</label>
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
                        <p className="text-platinum/50 text-xs mt-1">
                            Configure esta URL no painel Z-API como webhook de &quot;Received&quot; e &quot;Message Status&quot;
                        </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h3 className="text-white font-medium text-sm mb-3">Variaveis de Ambiente</h3>
                        <div className="space-y-2 font-mono text-xs">
                            <EnvVar name="ZAPI_INSTANCE_ID" desc="ID da instancia Z-API" />
                            <EnvVar name="ZAPI_TOKEN" desc="Token da instancia Z-API" />
                            <EnvVar name="ZAPI_SECURITY_TOKEN" desc="Client-Token para validacao de webhooks" />
                            <EnvVar name="OPENROUTER_API_KEY" desc="Chave API do OpenRouter (para IA SDR)" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTestConnection}
                            disabled={testing}
                            className="px-5 py-2.5 bg-gradient-to-r from-gold to-gold-light text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {testing ? 'Testando...' : 'Testar Conexao'}
                        </button>

                        {testResult && (
                            <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {testResult.message}
                            </div>
                        )}
                    </div>

                    <a
                        href="https://app.z-api.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gold text-sm hover:underline"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Abrir Painel Z-API
                    </a>
                </div>
            </motion.div>

            {/* AI Agent Configuration */}
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
                                <span><strong>Qualifica</strong> leads perguntando sobre empresa, plano atual e numero de vidas</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gold mt-1">2.</span>
                                <span><strong>Informa</strong> sobre planos SIX Saude (Essencial, Completo, Premium)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gold mt-1">3.</span>
                                <span><strong>Transfere</strong> para humano quando necessario (precos, reclamacoes, proposta)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gold mt-1">4.</span>
                                <span><strong>Agenda</strong> follow-ups automaticos</span>
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
                            <li>Contato pede explicitamente por humano</li>
                            <li>Negociacao detalhada de precos/contratos</li>
                            <li>Reclamacoes ou cancelamentos</li>
                            <li>Lead qualificado pronto para proposta</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Setup Guide */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-charcoal rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    <Settings className="w-5 h-5 text-gold" />
                    Guia de Configuracao
                </h2>

                <ol className="space-y-4 text-sm">
                    <Step n={1} title="Criar conta na Z-API" desc="Acesse z-api.io e crie uma conta. Crie uma instancia para seu numero." />
                    <Step n={2} title="Conectar WhatsApp" desc="No painel Z-API, escaneie o QR Code com o WhatsApp do numero de atendimento." />
                    <Step n={3} title="Copiar credenciais" desc="Copie o Instance ID, Token e Security Token do painel Z-API." />
                    <Step n={4} title="Configurar variaveis" desc="Adicione ZAPI_INSTANCE_ID, ZAPI_TOKEN e ZAPI_SECURITY_TOKEN no Vercel." />
                    <Step n={5} title="Configurar webhooks" desc="No painel Z-API, configure a URL de webhook (Received e Message Status) com a URL acima." />
                    <Step n={6} title="Testar" desc="Use o botao 'Testar Conexao' acima e envie uma mensagem de teste para o numero." />
                </ol>
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

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
    return (
        <li className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                {n}
            </span>
            <div>
                <p className="text-white font-medium">{title}</p>
                <p className="text-platinum mt-0.5">{desc}</p>
            </div>
        </li>
    )
}
