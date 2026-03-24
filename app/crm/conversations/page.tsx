'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare, Sparkles, Send, ToggleLeft, ToggleRight, X,
    Check, CheckCheck, AlertCircle, Paperclip, Image as ImageIcon,
    FileText, Mic, Video, MapPin, User, ChevronDown, UserCheck,
    Zap, Star, CheckSquare, Square, Filter, Users, XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/lib/auth/context'

interface AgentUser {
    id: string
    name: string
    email: string
    role: string
}

interface ConversationListItem {
    id: string
    status: string
    aiEnabled: boolean
    assignedTo: string | null
    lastMessageAt: string | null
    contact: {
        id: string
        name: string
        phone: string
        company: string | null
        status: string
        profilePictureUrl: string | null
    } | null
    assignedUser: { id: string; name: string } | null
    unreadCount: number
    lastMessage: string | null
}

interface Message {
    id: string
    direction: string
    sender: string
    content: string
    messageType: string
    mediaUrl: string | null
    aiGenerated: boolean
    status: string
    createdAt: string
}

interface ConversationDetail {
    id: string
    status: string
    aiEnabled: boolean
    assignedTo: string | null
    assignedUser: { id: string; name: string } | null
    contact: {
        id: string
        name: string
        phone: string
        company: string | null
        status: string
        planInterest: string | null
        leadScore: number | null
        profilePictureUrl: string | null
    } | null
    messages: Message[]
}

interface QuickReply {
    id: string
    title: string
    shortcut: string
    content: string
    category: string | null
}

const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'me', label: 'Minhas' },
    { value: 'unassigned', label: 'Sem atendente' },
    { value: 'active', label: 'IA Ativa' },
    { value: 'human', label: 'Humano' },
    { value: 'closed', label: 'Encerradas' },
]

function ContactAvatar({ name, profilePictureUrl, size = 10 }: { name: string; profilePictureUrl?: string | null; size?: number }) {
    const sizeClass = size === 10 ? 'w-10 h-10' : 'w-8 h-8'
    if (profilePictureUrl) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={profilePictureUrl}
                alt={name}
                className={`${sizeClass} rounded-full object-cover`}
            />
        )
    }
    return (
        <div className={`${sizeClass} rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0`}>
            <span className="text-gold font-medium text-sm">{name?.charAt(0)?.toUpperCase() || '?'}</span>
        </div>
    )
}

function MessageStatusIcon({ status }: { status: string }) {
    if (status === 'read') return <CheckCheck className="w-3.5 h-3.5 text-blue-400 inline ml-1" />
    if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-platinum/50 inline ml-1" />
    if (status === 'sent') return <Check className="w-3.5 h-3.5 text-platinum/50 inline ml-1" />
    if (status === 'failed') return <AlertCircle className="w-3.5 h-3.5 text-red-400 inline ml-1" />
    return null
}

function MessageBubble({ msg, lightboxSrc, setLightboxSrc }: {
    msg: Message
    lightboxSrc: string | null
    setLightboxSrc: (s: string | null) => void
}) {
    const isOutbound = msg.direction === 'outbound'

    const renderContent = () => {
        switch (msg.messageType) {
            case 'image':
                return msg.mediaUrl ? (
                    <div className="space-y-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={msg.mediaUrl}
                            alt="Imagem"
                            className="rounded-xl max-w-[240px] cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setLightboxSrc(msg.mediaUrl!)}
                        />
                        {msg.content && msg.content !== '[Imagem]' && (
                            <p className="text-white text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-platinum">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">{msg.content || '[Imagem]'}</span>
                    </div>
                )

            case 'video':
                return msg.mediaUrl ? (
                    <video controls className="rounded-xl max-w-[240px]">
                        <source src={msg.mediaUrl} />
                    </video>
                ) : (
                    <div className="flex items-center gap-2 text-platinum">
                        <Video className="w-4 h-4" />
                        <span className="text-sm">{msg.content || '[Vídeo]'}</span>
                    </div>
                )

            case 'audio':
                return msg.mediaUrl ? (
                    <audio controls className="max-w-[240px]">
                        <source src={msg.mediaUrl} />
                    </audio>
                ) : (
                    <div className="flex items-center gap-2 text-platinum">
                        <Mic className="w-4 h-4" />
                        <span className="text-sm">[Áudio]</span>
                    </div>
                )

            case 'document':
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-gold" />
                        </div>
                        <div>
                            {msg.mediaUrl ? (
                                <a
                                    href={msg.mediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm hover:underline"
                                >
                                    {msg.content || 'Documento'}
                                </a>
                            ) : (
                                <span className="text-platinum text-sm">{msg.content || '[Documento]'}</span>
                            )}
                        </div>
                    </div>
                )

            case 'location':
                return (
                    <div className="flex items-center gap-2 text-platinum">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span className="text-sm">{msg.content || '[Localização]'}</span>
                    </div>
                )

            default:
                return <p className="text-white text-sm whitespace-pre-wrap">{msg.content}</p>
        }
    }

    return (
        <div className={cn(
            'max-w-[75%] rounded-2xl px-4 py-3',
            isOutbound
                ? 'bg-gold/10 border border-gold/20 ml-auto'
                : 'bg-white/5 border border-white/10 mr-auto'
        )}>
            {msg.aiGenerated && (
                <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-gold" />
                    <span className="text-gold text-[10px] font-medium">IA</span>
                </div>
            )}
            {renderContent()}
            <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-platinum/50 text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isOutbound && <MessageStatusIcon status={msg.status} />}
            </div>
        </div>
    )
}

export default function ConversationsPage() {
    const { user: currentUser } = useAuth()
    const [conversations, setConversations] = useState<ConversationListItem[]>([])
    const [activeConv, setActiveConv] = useState<ConversationDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set())
    const [showBulkActions, setShowBulkActions] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [filterAgent, setFilterAgent] = useState<string>('')
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [agents, setAgents] = useState<AgentUser[]>([])
    const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
    const [showQuickReplies, setShowQuickReplies] = useState(false)
    const [quickReplyFilter, setQuickReplyFilter] = useState('')
    const [showAssignDropdown, setShowAssignDropdown] = useState(false)
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load agents and quick replies on mount
    useEffect(() => {
        fetch('/api/crm/users').then(r => r.json()).then(d => setAgents(d.data || []))
        fetch('/api/crm/quick-replies').then(r => r.json()).then(d => setQuickReplies(d.data || []))
    }, [])

    const loadConversations = useCallback(async () => {
        try {
            const params = new URLSearchParams({ limit: '50' })
            
            // Para vendedores, aplicar filtro "me" por padrão
            const isVendedor = currentUser?.role === 'vendedor'
            
            if (filter === 'me' || (isVendedor && filter === 'all')) {
                params.set('assignedTo', 'me')
            } else if (filter === 'unassigned') {
                params.set('assignedTo', 'unassigned')
            } else if (filter === 'active') {
                params.set('ai', 'active')
            } else if (filter === 'human') {
                params.set('ai', 'human')
            } else if (filter === 'closed') {
                params.set('status', 'closed')
            } else if (filterAgent) {
                params.set('assignedTo', filterAgent)
            }

            const res = await fetch(`/api/crm/conversations?${params}`)
            const data = await res.json()
            setConversations(data.data || [])
        } catch (error) {
            console.error('Error loading conversations:', error)
        } finally {
            setLoading(false)
        }
    }, [filter, filterAgent, currentUser?.role])

    useEffect(() => { loadConversations() }, [loadConversations])

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

    useEffect(() => {
        if (!activeConv) return
        const interval = setInterval(() => loadConversation(activeConv.id), 3000)
        return () => clearInterval(interval)
    }, [activeConv?.id])

    const handleSend = async (content?: string, messageType?: string, mediaUrl?: string, fileName?: string) => {
        const text = content || newMessage
        if (!text.trim() || !activeConv || sending) return
        setSending(true)
        try {
            await fetch(`/api/crm/conversations/${activeConv.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: text,
                    messageType: messageType || 'text',
                    ...(mediaUrl ? { mediaUrl } : {}),
                    ...(fileName ? { fileName } : {}),
                }),
            })
            if (!content) setNewMessage('')
            await loadConversation(activeConv.id)
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setSending(false)
        }
    }

    const handleFileUpload = async (file: File) => {
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.success) {
                const type = file.type.startsWith('image/') ? 'image'
                    : file.type.startsWith('video/') ? 'video'
                    : file.type.startsWith('audio/') ? 'audio'
                    : 'document'
                await handleSend(file.name, type, data.url, file.name)
            }
        } catch (error) {
            console.error('Upload error:', error)
        } finally {
            setUploading(false)
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

    const handleAssign = async (userId: string | null) => {
        if (!activeConv) return
        const res = await fetch(`/api/crm/conversations/${activeConv.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignedTo: userId }),
        })
        if (res.ok) {
            const agent = agents.find(a => a.id === userId)
            setActiveConv(prev => prev ? {
                ...prev,
                assignedTo: userId,
                assignedUser: userId && agent ? { id: agent.id, name: agent.name } : null,
            } : prev)
            setShowAssignDropdown(false)
            loadConversations()
        }
    }

    const handleInputChange = (value: string) => {
        setNewMessage(value)
        if (value.startsWith('/') && value.length >= 1) {
            const search = value.slice(1).toLowerCase()
            setQuickReplyFilter(search)
            setShowQuickReplies(true)
        } else {
            setShowQuickReplies(false)
        }
    }

    const applyQuickReply = (qr: QuickReply) => {
        setNewMessage(qr.content)
        setShowQuickReplies(false)
    }

    const toggleSelectAll = () => {
        if (selectedConversations.size === conversations.length) {
            setSelectedConversations(new Set())
        } else {
            setSelectedConversations(new Set(conversations.map(c => c.id)))
        }
    }

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedConversations)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedConversations(newSet)
    }

    const handleBulkAssign = async (userId: string | null) => {
        const ids = Array.from(selectedConversations)
        try {
            await Promise.all(
                ids.map(id =>
                    fetch(`/api/crm/conversations/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assignedTo: userId }),
                    })
                )
            )
            setSelectedConversations(new Set())
            setShowBulkActions(false)
            loadConversations()
        } catch (error) {
            console.error('Error bulk assigning:', error)
        }
    }

    const handleBulkClose = async () => {
        const ids = Array.from(selectedConversations)
        try {
            await Promise.all(
                ids.map(id =>
                    fetch(`/api/crm/conversations/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'closed' }),
                    })
                )
            )
            setSelectedConversations(new Set())
            setShowBulkActions(false)
            loadConversations()
        } catch (error) {
            console.error('Error bulk closing:', error)
        }
    }

    const filteredQuickReplies = quickReplies.filter(qr =>
        !quickReplyFilter ||
        qr.shortcut.toLowerCase().includes(quickReplyFilter) ||
        qr.title.toLowerCase().includes(quickReplyFilter)
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Conversas</h1>
                <p className="text-platinum mt-1">Inbox do WhatsApp</p>
            </div>

            <div className="flex gap-6 h-[calc(100vh-220px)]">
                {/* Left Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-96 flex-shrink-0 bg-charcoal rounded-2xl border border-white/10 flex flex-col overflow-hidden"
                >
                    {/* Filters */}
                    <div className="p-4 border-b border-white/10 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-1 flex-wrap flex-1">
                                {filterOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setFilter(opt.value); setFilterAgent('') }}
                                        className={cn(
                                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                            filter === opt.value && !filterAgent
                                                ? 'bg-gold/10 text-gold'
                                                : 'text-platinum hover:bg-white/5'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowFilters(v => !v)}
                                className={cn(
                                    'p-2 rounded-lg transition-all',
                                    showFilters ? 'bg-gold/10 text-gold' : 'text-platinum hover:bg-white/5'
                                )}
                                title="Filtros avançados"
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-platinum" />
                                <select
                                    value={filterAgent}
                                    onChange={(e) => { setFilterAgent(e.target.value); setFilter('all') }}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold/50"
                                >
                                    <option value="">Todos os agentes</option>
                                    <option value="me">Meus atendimentos</option>
                                    <option value="unassigned">Não atribuídos</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Bulk Actions Bar */}
                        {selectedConversations.size > 0 && (
                            <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-lg px-3 py-2">
                                <span className="text-gold text-xs font-medium flex-1">
                                    {selectedConversations.size} selecionada(s)
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setShowBulkActions(true)}
                                        className="p-1.5 rounded bg-gold/20 text-gold hover:bg-gold/30"
                                        title="Atribuir"
                                    >
                                        <UserCheck className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={handleBulkClose}
                                        className="p-1.5 rounded bg-white/10 text-platinum hover:text-white"
                                        title="Encerrar"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedConversations(new Set())}
                                        className="p-1.5 rounded bg-white/10 text-platinum hover:text-white"
                                        title="Limpar seleção"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Bulk Assign Dropdown */}
                        {showBulkActions && (
                            <div className="absolute left-4 top-24 w-56 bg-charcoal border border-white/10 rounded-xl shadow-xl z-30 overflow-hidden">
                                <div className="px-3 py-2 border-b border-white/10">
                                    <p className="text-white text-sm font-medium">Atribuir {selectedConversations.size} conversa(s)</p>
                                </div>
                                {currentUser && (
                                    <button
                                        onClick={() => handleBulkAssign(currentUser.id)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gold/10 flex items-center gap-2"
                                    >
                                        <UserCheck className="w-4 h-4 text-gold" />
                                        Assumir conversa(s)
                                    </button>
                                )}
                                {agents.map(agent => (
                                    <button
                                        key={agent.id}
                                        onClick={() => handleBulkAssign(agent.id)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-platinum hover:bg-white/5 flex items-center gap-2"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                            {agent.name.charAt(0)}
                                        </div>
                                        {agent.name}
                                    </button>
                                ))}
                                <div className="border-t border-white/10" />
                                <button
                                    onClick={() => handleBulkAssign(null)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                                >
                                    Remover atribuição
                                </button>
                                <button
                                    onClick={() => setShowBulkActions(false)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-platinum hover:bg-white/5 border-t border-white/10"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
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
                            <div className="relative">
                                {/* Select All */}
                                <div className="sticky top-0 bg-charcoal border-b border-white/10 px-4 py-2 flex items-center gap-2 z-10">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-platinum hover:text-white"
                                    >
                                        {selectedConversations.size === conversations.length && conversations.length > 0 ? (
                                            <CheckSquare className="w-4 h-4" />
                                        ) : (
                                            <Square className="w-4 h-4" />
                                        )}
                                    </button>
                                    <span className="text-xs text-platinum">Selecionar todas</span>
                                </div>
                                {conversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        className={cn(
                                            'flex items-start gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors',
                                            activeConv?.id === conv.id && 'bg-gold/5 border-l-2 border-l-gold'
                                        )}
                                    >
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleSelect(conv.id) }}
                                            className="mt-2 text-platinum hover:text-white"
                                        >
                                            {selectedConversations.has(conv.id) ? (
                                                <CheckSquare className="w-4 h-4 text-gold" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => loadConversation(conv.id)}
                                            className="flex-1 text-left"
                                        >
                                            <div className="flex items-start gap-3">
                                                <ContactAvatar
                                                    name={conv.contact?.name || '?'}
                                                    profilePictureUrl={conv.contact?.profilePictureUrl}
                                                    size={8}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-white font-medium truncate text-sm">
                                                            {conv.contact?.name || 'Desconhecido'}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                                            {conv.aiEnabled && <Sparkles className="w-3 h-3 text-gold" />}
                                                            {conv.unreadCount > 0 && (
                                                                <span className="w-5 h-5 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center">
                                                                    {conv.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-platinum text-xs truncate mt-0.5">
                                                        {conv.lastMessage || 'Sem mensagens'}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        {conv.assignedUser ? (
                                                            <span className="text-gold/70 text-[10px] truncate flex items-center gap-1">
                                                                <User className="w-2.5 h-2.5" />
                                                                {conv.assignedUser.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-platinum/30 text-[10px]">Sem atendente</span>
                                                        )}
                                                        {conv.lastMessageAt && (
                                                            <span className="text-platinum/50 text-[10px] flex-shrink-0">
                                                                {formatTime(conv.lastMessageAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>
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
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <ContactAvatar
                                        name={activeConv.contact?.name || '?'}
                                        profilePictureUrl={activeConv.contact?.profilePictureUrl}
                                    />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium truncate">{activeConv.contact?.name}</p>
                                            {activeConv.contact?.leadScore && (
                                                <span className={cn(
                                                    'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border flex-shrink-0',
                                                    activeConv.contact.leadScore >= 4 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                                                    activeConv.contact.leadScore >= 3 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                                                    'text-blue-400 bg-blue-500/10 border-blue-500/20'
                                                )}>
                                                    <Star className="w-2.5 h-2.5" fill="currentColor" />
                                                    {activeConv.contact.leadScore}/5
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-platinum text-sm">{activeConv.contact?.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Assign dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowAssignDropdown(v => !v)}
                                            className={cn(
                                                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                                                activeConv.assignedUser
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-white/5 text-platinum border-white/10'
                                            )}
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            <span className="truncate max-w-[100px]">
                                                {activeConv.assignedUser?.name || 'Atribuir'}
                                            </span>
                                            <ChevronDown className="w-3 h-3" />
                                        </button>

                                        {showAssignDropdown && (
                                            <div className="absolute right-0 top-full mt-1 w-52 bg-charcoal border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                                                {currentUser && (
                                                    <button
                                                        onClick={() => handleAssign(currentUser.id)}
                                                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gold/10 flex items-center gap-2"
                                                    >
                                                        <UserCheck className="w-4 h-4 text-gold" />
                                                        Assumir conversa
                                                    </button>
                                                )}
                                                <div className="border-t border-white/10" />
                                                {agents.map(agent => (
                                                    <button
                                                        key={agent.id}
                                                        onClick={() => handleAssign(agent.id)}
                                                        className={cn(
                                                            'w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex items-center gap-2',
                                                            activeConv.assignedTo === agent.id ? 'text-gold' : 'text-platinum'
                                                        )}
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                                            {agent.name.charAt(0)}
                                                        </div>
                                                        {agent.name}
                                                    </button>
                                                ))}
                                                {activeConv.assignedTo && (
                                                    <>
                                                        <div className="border-t border-white/10" />
                                                        <button
                                                            onClick={() => handleAssign(null)}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                                                        >
                                                            Remover atribuição
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Toggle */}
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
                                        IA {activeConv.aiEnabled ? 'Ativa' : 'Off'}
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
                            <div
                                className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
                                onClick={() => { setShowAssignDropdown(false); setShowQuickReplies(false) }}
                            >
                                {activeConv.messages.map(msg => (
                                    <MessageBubble
                                        key={msg.id}
                                        msg={msg}
                                        lightboxSrc={lightboxSrc}
                                        setLightboxSrc={setLightboxSrc}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Replies Popup */}
                            <AnimatePresence>
                                {showQuickReplies && filteredQuickReplies.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mx-6 mb-1 bg-black border border-white/10 rounded-xl overflow-hidden shadow-xl"
                                    >
                                        {filteredQuickReplies.slice(0, 5).map(qr => (
                                            <button
                                                key={qr.id}
                                                onClick={() => applyQuickReply(qr)}
                                                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3 border-b border-white/5 last:border-0"
                                            >
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Zap className="w-3.5 h-3.5 text-gold" />
                                                    <code className="text-gold text-xs font-mono">{qr.shortcut}</code>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-medium">{qr.title}</p>
                                                    <p className="text-platinum text-xs truncate">{qr.content}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Input */}
                            <div className="px-6 py-4 border-t border-white/10">
                                <div className="flex gap-3 items-center">
                                    {/* Attachment button */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                        onChange={e => {
                                            const file = e.target.files?.[0]
                                            if (file) handleFileUpload(file)
                                            e.target.value = ''
                                        }}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="p-3 bg-white/5 rounded-xl border border-white/10 text-platinum hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                                        title="Enviar arquivo"
                                    >
                                        {uploading ? (
                                            <div className="w-5 h-5 border-2 border-platinum/30 border-t-platinum rounded-full animate-spin" />
                                        ) : (
                                            <Paperclip className="w-5 h-5" />
                                        )}
                                    </button>

                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => handleInputChange(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSend()
                                                }
                                                if (e.key === 'Escape') setShowQuickReplies(false)
                                            }}
                                            placeholder="Digite sua mensagem... (/ para respostas rápidas)"
                                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-platinum/50 focus:outline-none focus:border-gold/50"
                                        />
                                    </div>

                                    <button
                                        onClick={() => handleSend()}
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

            {/* Lightbox */}
            {lightboxSrc && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                    onClick={() => setLightboxSrc(null)}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={lightboxSrc}
                        alt="Imagem ampliada"
                        className="max-w-full max-h-full rounded-xl"
                    />
                </div>
            )}
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
