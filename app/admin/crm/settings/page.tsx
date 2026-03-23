'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, MessageSquare, Sparkles, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react'

export default function CRMSettingsPage() {
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
    const [copied, setCopied] = useState(false)

    const webhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/whatsapp/webhook`
        : '/api/whatsapp/webhook'

    const handleTestConnection = async () => {
        setTesting(true)
        setTestResult(null)
        try {
            const res = await fetch('/api/crm/whatsapp/test', { method: 'POST' })
            const data = await res.json()
            setTestResult({
                success: data.success,
                message: data.success
                    ? `Conectado! Número: ${data.phoneNumber}`
                    : data.error || 'Falha na conexão',
            })
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

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold text-white">Configurações CRM</h1>
                <p className="text-platinum mt-1">WhatsApp Business API e Agente IA</p>
            </div>

            {/* WhatsApp Configuration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-charcoal rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    WhatsApp Business API
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-platinum text-sm mb-1">Webhook URL</label>
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
                            Configure esta URL no Meta Business Manager como webhook do WhatsApp
                        </p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h3 className="text-white font-medium text-sm mb-3">Variáveis de Ambiente Necessárias</h3>
                        <div className="space-y-2 font-mono text-xs">
                            <EnvVar name="WHATSAPP_PHONE_NUMBER_ID" desc="ID do número no Meta Business" />
                            <EnvVar name="WHATSAPP_BUSINESS_ACCOUNT_ID" desc="ID da conta business" />
                            <EnvVar name="WHATSAPP_ACCESS_TOKEN" desc="Token de acesso permanente" />
                            <EnvVar name="WHATSAPP_VERIFY_TOKEN" desc="Token de verificação do webhook" />
                            <EnvVar name="WHATSAPP_APP_SECRET" desc="App secret para validação HMAC" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTestConnection}
                            disabled={testing}
                            className="px-5 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {testing ? 'Testando...' : 'Testar Conexão'}
                        </button>

                        {testResult && (
                            <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {testResult.message}
                            </div>
                        )}
                    </div>

                    <a
                        href="https://business.facebook.com/settings/whatsapp-business-accounts"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gold text-sm hover:underline"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Abrir Meta Business Manager
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
                                <span><strong>Qualifica</strong> leads perguntando sobre empresa, plano atual e número de vidas</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gold mt-1">2.</span>
                                <span><strong>Informa</strong> sobre planos SIX Saúde (Essencial, Completo, Premium)</span>
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
                            <li>Contato pede explicitamente por humano</li>
                            <li>Negociação detalhada de preços/contratos</li>
                            <li>Reclamações ou cancelamentos</li>
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
                    Guia de Configuração
                </h2>

                <ol className="space-y-4 text-sm">
                    <Step n={1} title="Criar app no Meta Developers" desc="Acesse developers.facebook.com e crie um app tipo Business" />
                    <Step n={2} title="Configurar WhatsApp Business" desc="Adicione o produto WhatsApp ao app e configure um número de teste" />
                    <Step n={3} title="Obter tokens" desc="Gere um token de acesso permanente (System User Token)" />
                    <Step n={4} title="Configurar variáveis" desc="Adicione todas as env vars no Vercel/ambiente de produção" />
                    <Step n={5} title="Configurar webhook" desc="No Meta Business, configure a URL do webhook acima e inscreva para messages e message_deliveries" />
                    <Step n={6} title="Testar" desc="Use o botão 'Testar Conexão' acima e envie uma mensagem de teste" />
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
