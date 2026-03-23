'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Sparkles, User, Send, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ConversationListItem {
    id: string
    status: string
    aiEnabled: boolean
    lastMessageAt: string | null
    contact: { id: string; name: string; phone: string; company: string | null; status: string } | null
    unreadCount: number
    lastMessage: string | null
}

interface Message {
    id: string
    direction: string
    sender: string
    content: string
    messageType: string
    aiGenerated: boolean
    status: string
    createdAt: string
}

interface ConversationDetail {
    id: string
    status: string
    aiEnabled: boolean
    contact: { id: string; name: string; phone: string; company: string | null; status: string; planInterest: string | null } | null
    messages: Message[]
}

const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'IA Ativa' },
    { value: 'human', label: 'Humano' },
    { value: 'closed', label: 'Encerradas' },
]

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<ConversationListItem[]>([])
    const [activeConv, setActiveConv] = useState<ConversationDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const loadConversations = useCallback(async () => {
        try {
            const params = new URLSearchParams({ limit: '50' })
            if (filter === 'active') params.set('ai', 'active')
            else if (filter === 'human') params.set('ai', 'human')
            else if (filter === 'closed') params.set('status', 'closed')

            const res = await fetch(`/api/crm/conversations?${params}`)
            const data = await res.json()
            setConversations(data.data || [])
        } catch (error) {
            console.error('Error loading conversations:', error)
        } finally {
            setLoading(false)
        }
    }, [filter])

    useEffect(() => { loadConversations() }, [loadConversations])

    // Poll for updates
    useEffect(() => {
        const interval = setInterval(loadConversations, 10000)
        return () => clearInterval(interval)
    }, [loadConversations])

    const loadConversation = async (id: string) => {
        try {
            const res = await fetch(`/api/crm/conversations/${id}`)
            const data = await res.json()
            setActiveConv(data)
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        } catch (error) {
            console.error('Error loading conversation:', error)
        }
    }

    // Poll active conversation messages
    useEffect(() => {
        if (!activeConv) return
        const interval = setInterval(() => loadConversation(activeConv.id), 3000)
        return () => clearInterval(interval)
    }, [activeConv?.id])

    const handleSend = async () => {
        if (!newMessage.trim() || !activeConv || sending) return
        setSending(true)
        try {
            await fetch(`/api/crm/conversations/${activeConv.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage }),
            })
            setNewMessage('')
            await loadConversation(activeConv.id)
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setSending(false)
        }
    }

    const toggleAI = async () => {
        if (!activeConv) return
        const res = await fetch(`/api/crm/conversations/${activeConv.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aiEnabled: !activeConv.aiEnabled }),
        })
        if (res.ok) {
            setActiveConv(prev => prev ? { ...prev, aiEnabled: !prev.aiEnabled } : prev)
            loadConversations()
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Conversas</h1>
                <p className="text-platinum mt-1">Inbox do WhatsApp</p>
            </div>

            <div className="flex gap-6 h-[calc(100vh-220px)]">
                {/* Left Panel - Conversation List */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-96 flex-shrink-0 bg-charcoal rounded-2xl border border-white/10 flex flex-col overflow-hidden"
                >
                    {/* Filters */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex gap-1">
                            {filterOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilter(opt.value)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                        filter === opt.value
                                            ? 'bg-gold/10 text-gold'
                                            : 'text-platinum hover:bg-white/5'
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse h-16 bg-white/5 rounded-xl" />
                                ))}
                            </div>
                        ) : conversations.length > 0 ? (
                            conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => loadConversation(conv.id)}
                                    className={cn(
                                        'w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors',
                                        activeConv?.id === conv.id && 'bg-gold/5 border-l-2 border-l-gold'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-medium truncate">
                                            {conv.contact?.name || 'Desconhecido'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {conv.aiEnabled && <Sparkles className="w-3 h-3 text-gold" />}
                                            {conv.unreadCount > 0 && (
                                                <span className="w-5 h-5 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-platinum text-sm truncate mt-1">
                                        {conv.lastMessage || 'Sem mensagens'}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-platinum/50 text-xs">
                                            {conv.contact?.phone}
                                        </span>
                                        {conv.lastMessageAt && (
                                            <span className="text-platinum/50 text-xs">
                                                {formatTime(conv.lastMessageAt)}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <MessageSquare className="w-12 h-12 text-platinum/50 mx-auto mb-3" />
                                <p className="text-platinum">Nenhuma conversa</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Panel - Chat */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 bg-charcoal rounded-2xl border border-white/10 flex flex-col overflow-hidden"
                >
                    {activeConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gold" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{activeConv.contact?.name}</p>
                                        <p className="text-platinum text-sm">{activeConv.contact?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={toggleAI}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                                            activeConv.aiEnabled
                                                ? 'bg-gold/10 text-gold border-gold/20'
                                                : 'bg-white/5 text-platinum border-white/10'
                                        )}
                                    >
                                        {activeConv.aiEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        IA {activeConv.aiEnabled ? 'Ativa' : 'Desligada'}
                                    </button>
                                    <button
                                        onClick={() => setActiveConv(null)}
                                        className="text-platinum hover:text-white lg:hidden"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                                {activeConv.messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            'max-w-[75%] rounded-2xl px-4 py-3',
                                            msg.direction === 'inbound'
                                                ? 'bg-white/5 border border-white/10 mr-auto'
                                                : 'bg-gold/10 border border-gold/20 ml-auto'
                                        )}
                                    >
                                        {msg.aiGenerated && (
                                            <div className="flex items-center gap-1 mb-1">
                                                <Sparkles className="w-3 h-3 text-gold" />
                                                <span className="text-gold text-[10px] font-medium">IA</span>
                                            </div>
                                        )}
                                        <p className="text-white text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <p className="text-platinum/50 text-[10px] mt-1 text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="px-6 py-4 border-t border-white/10">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                        placeholder="Digite sua mensagem..."
                                        className="flex-1 px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-platinum/50 focus:outline-none focus:border-gold/50"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!newMessage.trim() || sending}
                                        className="px-4 py-3 bg-gold-primary text-black rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 text-platinum/30 mx-auto mb-4" />
                                <p className="text-platinum text-lg">Selecione uma conversa</p>
                                <p className="text-platinum/50 text-sm mt-1">Escolha uma conversa ao lado para visualizar</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

function formatTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `${diffMins}min`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
