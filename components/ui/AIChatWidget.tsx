'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, MessageCircle, UserCheck } from 'lucide-react'

type ChatMsg = { id: string; role: 'user' | 'assistant'; text: string }

function generateId() {
    return Math.random().toString(36).slice(2)
}

function getOrCreateSessionId(): string {
    const key = 'six_chat_session'
    let id = localStorage.getItem(key)
    if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : generateId()
        localStorage.setItem(key, id)
    }
    return id
}

/**
 * AI Chat Widget - Amélia Saúde Design System
 *
 * Premium floating chat widget with:
 * - Yellow theme matching brand colors
 * - AI icon with pulse animation
 * - Expandable chat panel
 * - SDR Agent responses via CRM
 * - WhatsApp handoff option
 */
export const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [msgs, setMsgs] = useState<ChatMsg[]>([])
    const [loading, setLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [handoff, setHandoff] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setSessionId(getOrCreateSessionId())
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [msgs, loading])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading || !sessionId) return

        const userText = input.trim()
        setInput('')
        setMsgs((prev) => [...prev, { id: generateId(), role: 'user', text: userText }])
        setLoading(true)

        try {
            const res = await fetch('/api/chat/website', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, sessionId, conversationId }),
            })

            if (!res.ok) throw new Error('Request failed')

            const data = await res.json()

            if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId)
            }

            if (data.handoff) {
                setHandoff(true)
            }

            setMsgs((prev) => [
                ...prev,
                { id: generateId(), role: 'assistant', text: data.reply },
            ])
        } catch {
            setMsgs((prev) => [
                ...prev,
                {
                    id: generateId(),
                    role: 'assistant',
                    text: 'Desculpe, ocorreu um erro. Tente novamente em instantes.',
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent(
            'Olá! Vim pelo chat do site da Amélia Saúde e gostaria de falar com um especialista.'
        )
        window.open(`https://wa.me/5511999999999?text=${message}`, '_blank', 'noopener,noreferrer')
    }

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-40 group"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: 1,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Abrir chat de IA"
                title="Assistente Virtual Amélia Saúde"
            >
                {/* Pulse ring effect */}
                <motion.span
                    className="absolute inset-0 rounded-full bg-[#F6C200]"
                    animate={{
                        scale: [1, 1.4, 1.4],
                        opacity: [0.4, 0, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeOut',
                    }}
                />

                {/* Secondary pulse */}
                <motion.span
                    className="absolute inset-0 rounded-full bg-[#F6C200]"
                    animate={{
                        scale: [1, 1.2, 1.2],
                        opacity: [0.3, 0, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeOut',
                        delay: 0.3,
                    }}
                />

                {/* Main button */}
                <span
                    className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#F6C200] text-black shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    style={{
                        boxShadow: '0 4px 20px rgba(246, 194, 0, 0.4)',
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.span
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X size={28} strokeWidth={2} />
                            </motion.span>
                        ) : (
                            <motion.span
                                key="sparkles"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Sparkles size={28} strokeWidth={2} />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </span>
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-24 right-6 z-40 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-150px)] bg-[#0A0A0A] border border-[#F6C200]/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        style={{
                            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(246, 194, 0, 0.1)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#F6C200] to-[#E5B400] text-black">
                            <div className="flex items-center gap-2">
                                <Sparkles size={20} />
                                <div>
                                    <h3 className="font-semibold text-sm">Assistente Amélia Saúde</h3>
                                    <p className="text-xs opacity-75">Online • Responde em segundos</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-black/10 rounded-full transition-colors"
                                aria-label="Fechar chat"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Welcome message */}
                            {msgs.length === 0 && (
                                <div className="bg-[#1A1A1A] rounded-lg p-3 text-sm text-gray-300">
                                    <p className="mb-2">
                                        👋 Olá! Sou o assistente virtual da <strong className="text-[#F6C200]">Amélia Saúde</strong>.
                                    </p>
                                    <p>Como posso ajudar você hoje?</p>
                                </div>
                            )}

                            {msgs.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user'
                                            ? 'bg-[#F6C200] text-black'
                                            : 'bg-[#1A1A1A] text-gray-200'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1A1A1A] rounded-lg px-3 py-2">
                                        <motion.div
                                            className="flex gap-1"
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            {[0, 1, 2].map((i) => (
                                                <motion.span
                                                    key={i}
                                                    className="w-2 h-2 bg-[#F6C200] rounded-full"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        delay: i * 0.2,
                                                    }}
                                                />
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Handoff banner or WhatsApp button */}
                        {handoff ? (
                            <div className="px-4 pb-2">
                                <div className="flex items-center gap-2 py-2 px-3 bg-[#1A1A1A] border border-[#F6C200]/30 rounded-lg text-xs text-[#F6C200]">
                                    <UserCheck size={14} className="shrink-0" />
                                    <span>Atendimento humano ativo — nossa equipe responderá em breve</span>
                                </div>
                            </div>
                        ) : (
                            <div className="px-4 pb-2">
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-400 hover:text-[#25D366] transition-colors"
                                >
                                    <MessageCircle size={14} />
                                    Prefere falar com um humano? Clique aqui
                                </button>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F6C200]/50 transition-colors"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="px-3 py-2 bg-[#F6C200] text-black rounded-lg hover:bg-[#E5B400] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Enviar mensagem"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
