'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Plug, 
    Webhook, 
    MessageSquare, 
    Database, 
    Key, 
    CheckCircle2, 
    XCircle,
    Loader2,
    Settings
} from 'lucide-react'

interface Connection {
    id: string
    name: string
    type: 'whatsapp' | 'api' | 'webhook' | 'database'
    status: 'connected' | 'disconnected' | 'error'
    lastSync?: string
    description: string
}

const mockConnections: Connection[] = [
    {
        id: '1',
        name: 'WhatsApp Business',
        type: 'whatsapp',
        status: 'connected',
        lastSync: '2024-01-15T10:30:00Z',
        description: 'Integração com API do WhatsApp Business'
    },
    {
        id: '2',
        name: 'OpenAI API',
        type: 'api',
        status: 'connected',
        lastSync: '2024-01-15T10:00:00Z',
        description: 'API para geração de conteúdo com IA'
    },
    {
        id: '3',
        name: 'Webhook - CRM',
        type: 'webhook',
        status: 'disconnected',
        description: 'Envio de eventos para sistema externo'
    },
    {
        id: '4',
        name: 'Banco de Dados',
        type: 'database',
        status: 'connected',
        lastSync: '2024-01-15T10:35:00Z',
        description: 'Conexão com banco de dados PostgreSQL'
    },
]

export default function ConnectionsPage() {
    const [connections, setConnections] = useState<Connection[]>(mockConnections)
    const [loading, setLoading] = useState<string | null>(null)

    const getTypeIcon = (type: Connection['type']) => {
        switch (type) {
            case 'whatsapp':
                return <MessageSquare className="w-6 h-6" />
            case 'api':
                return <Key className="w-6 h-6" />
            case 'webhook':
                return <Webhook className="w-6 h-6" />
            case 'database':
                return <Database className="w-6 h-6" />
        }
    }

    const getTypeColor = (type: Connection['type']) => {
        switch (type) {
            case 'whatsapp':
                return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'api':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'webhook':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'database':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        }
    }

    const getStatusIcon = (status: Connection['status']) => {
        switch (status) {
            case 'connected':
                return <CheckCircle2 className="w-5 h-5 text-green-400" />
            case 'disconnected':
                return <XCircle className="w-5 h-5 text-platinum" />
            case 'error':
                return <XCircle className="w-5 h-5 text-red-400" />
        }
    }

    const handleSync = async (id: string) => {
        setLoading(id)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setConnections(prev => prev.map(c => 
            c.id === id 
                ? { ...c, lastSync: new Date().toISOString() }
                : c
        ))
        setLoading(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Conexões</h1>
                    <p className="text-platinum mt-1">Gerencie integrações e APIs externas</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity">
                    <Plug className="w-5 h-5" />
                    Nova Conexão
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connections.map((connection, index) => (
                    <motion.div
                        key={connection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-charcoal rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl border ${getTypeColor(connection.type)}`}>
                                    {getTypeIcon(connection.type)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{connection.name}</h3>
                                    <p className="text-sm text-platinum">{connection.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(connection.status)}
                                <span className={`text-sm font-medium ${
                                    connection.status === 'connected' ? 'text-green-400' :
                                    connection.status === 'error' ? 'text-red-400' : 'text-platinum'
                                }`}>
                                    {connection.status === 'connected' ? 'Conectado' :
                                     connection.status === 'error' ? 'Erro' : 'Desconectado'}
                                </span>
                            </div>
                        </div>

                        {connection.lastSync && (
                            <p className="text-sm text-platinum mb-4">
                                Última sincronização: {new Date(connection.lastSync).toLocaleString('pt-BR')}
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSync(connection.id)}
                                disabled={loading === connection.id || connection.status !== 'connected'}
                                className="flex-1 py-2 px-4 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading === connection.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sincronizando...
                                    </>
                                ) : (
                                    'Sincronizar'
                                )}
                            </button>
                            <button className="p-2 text-platinum hover:text-white transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
