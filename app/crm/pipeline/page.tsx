'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Building2, ChevronLeft, ChevronRight, DollarSign, X, Phone, Mail, Users, Tag, FileText, ExternalLink, Calendar, Layers, Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'
import Link from 'next/link'

interface PipelineStage {
    id: string
    name: string
    slug: string
    color: string | null
    order: number
}

interface Deal {
    id: string
    title: string
    value: number | null
    planInterest: string | null
    livesCount: number | null
    createdAt: string
    contact: {
        id: string
        name: string
        phone: string
        company: string | null
        profilePictureUrl: string | null
        leadScore: number | null
    } | null
    stage: { id: string; name: string; slug: string; color: string | null; order: number } | null
    assignedUser: { id: string; name: string } | null
}

interface ContactDetail {
    id: string
    name: string
    phone: string
    email: string | null
    company: string | null
    source: string
    status: string
    planInterest: string | null
    livesCount: number | null
    leadScore: number | null
    notes: string | null
    cpfCnpj: string | null
    lastContactAt: string | null
    createdAt: string
    tags: string[]
    assignedUser: { id: string; name: string } | null
}

const statusLabels: Record<string, string> = {
    new: 'Novo', contacted: 'Contactado', qualified: 'Qualificado',
    proposal: 'Proposta', won: 'Ganho', lost: 'Perdido',
}
const statusColors: Record<string, string> = {
    new: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    contacted: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    qualified: 'bg-gold/15 text-gold border-gold/20',
    proposal: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    won: 'bg-green-500/15 text-green-400 border-green-500/20',
    lost: 'bg-red-500/15 text-red-400 border-red-500/20',
}
const sourceLabels: Record<string, string> = {
    whatsapp: 'WhatsApp', website: 'Website', manual: 'Manual',
}

const pipelineScoreColors: Record<number, string> = {
    1: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    2: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    3: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    4: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    5: 'text-red-400 bg-red-500/10 border-red-500/20',
}

function PipelineLeadScore({ score }: { score: number }) {
    return (
        <span className={cn(
            'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border',
            pipelineScoreColors[score] || pipelineScoreColors[1]
        )}>
            <Star className="w-2.5 h-2.5" fill="currentColor" />
            {score}
        </span>
    )
}

function DealDetailModal({ deal, onClose }: { deal: Deal; onClose: () => void }) {
    const [contact, setContact] = useState<ContactDetail | null>(null)
    const [loadingContact, setLoadingContact] = useState(false)

    useEffect(() => {
        if (!deal.contact?.id) return
        setLoadingContact(true)
        Promise.all([
            fetch(`/api/crm/contacts/${deal.contact.id}`).then(r => r.json()),
            fetch(`/api/crm/contacts/${deal.contact.id}/tags`).then(r => r.json()),
        ])
            .then(([contactData, tagsData]) => {
                if (!contactData.error) {
                    const tags = (tagsData.data || []).map((t: { tag: string }) => t.tag)
                    setContact({ ...contactData, tags })
                }
            })
            .catch(() => null)
            .finally(() => setLoadingContact(false))
    }, [deal.contact?.id])

    const stageColor = deal.stage?.color || '#666666'

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-[#161616] rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-white/8">
                    <div className="flex-1 min-w-0 pr-4">
                        <p className="text-white font-semibold text-lg leading-snug">{deal.title}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span
                                className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                                style={{ backgroundColor: `${stageColor}20`, color: stageColor, borderColor: `${stageColor}30` }}
                            >
                                {deal.stage?.name || 'Sem etapa'}
                            </span>
                            {contact?.status && (
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[contact.status] || 'bg-white/10 text-platinum border-white/10'}`}>
                                    {statusLabels[contact.status] || contact.status}
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-platinum/60 hover:text-white transition-colors flex-shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Deal Info */}
                    <div className="grid grid-cols-2 gap-3">
                        {deal.value != null && (
                            <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400/70 text-[10px] uppercase tracking-wider font-semibold">Valor</span>
                                </div>
                                <p className="text-emerald-300 font-bold text-base">
                                    {(deal.value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                                </p>
                            </div>
                        )}
                        {deal.planInterest && (
                            <div className="bg-gold/8 border border-gold/15 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Tag className="w-3.5 h-3.5 text-gold" />
                                    <span className="text-gold/70 text-[10px] uppercase tracking-wider font-semibold">Plano</span>
                                </div>
                                <p className="text-gold font-semibold text-sm">{deal.planInterest}</p>
                            </div>
                        )}
                        {deal.livesCount != null && (
                            <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Users className="w-3.5 h-3.5 text-platinum/60" />
                                    <span className="text-platinum/50 text-[10px] uppercase tracking-wider font-semibold">Vidas</span>
                                </div>
                                <p className="text-white font-semibold text-sm">{deal.livesCount}</p>
                            </div>
                        )}
                        {deal.contact?.leadScore && (
                            <div className={cn(
                                'rounded-xl p-3 border',
                                pipelineScoreColors[deal.contact.leadScore]?.split(' ').slice(1).join(' ') || 'bg-white/5 border-white/8'
                            )}>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Star className="w-3.5 h-3.5" fill="currentColor" />
                                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">Lead Score</span>
                                </div>
                                <PipelineLeadScore score={deal.contact.leadScore} />
                            </div>
                        )}
                        <div className="bg-white/5 border border-white/8 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Calendar className="w-3.5 h-3.5 text-platinum/60" />
                                <span className="text-platinum/50 text-[10px] uppercase tracking-wider font-semibold">Criado em</span>
                            </div>
                            <p className="text-white/80 text-sm">{new Date(deal.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    {deal.contact && (
                        <div>
                            <p className="text-platinum/50 text-xs uppercase tracking-wider font-semibold mb-3">Contato</p>
                            <div className="bg-white/5 border border-white/8 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <ContactAvatarLg contact={deal.contact} />
                                    <div>
                                        <p className="text-white font-semibold">{deal.contact.name}</p>
                                        {deal.contact.company && (
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Building2 className="w-3.5 h-3.5 text-platinum/40" />
                                                <p className="text-platinum/60 text-sm">{deal.contact.company}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {loadingContact ? (
                                    <div className="space-y-2">
                                        <div className="animate-pulse h-4 bg-white/10 rounded w-2/3" />
                                        <div className="animate-pulse h-4 bg-white/10 rounded w-1/2" />
                                    </div>
                                ) : (
                                    <div className="space-y-2 pt-1 border-t border-white/8">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-platinum/40 flex-shrink-0" />
                                            <span className="text-platinum/80 text-sm">{deal.contact.phone}</span>
                                        </div>
                                        {contact?.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-platinum/40 flex-shrink-0" />
                                                <span className="text-platinum/80 text-sm">{contact.email}</span>
                                            </div>
                                        )}
                                        {contact?.source && (
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-3.5 h-3.5 text-platinum/40 flex-shrink-0" />
                                                <span className="text-platinum/60 text-sm">Origem: {sourceLabels[contact.source] || contact.source}</span>
                                            </div>
                                        )}
                                        {contact?.cpfCnpj && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-platinum/40 flex-shrink-0" />
                                                <span className="text-platinum/60 text-sm">CPF/CNPJ: {contact.cpfCnpj}</span>
                                            </div>
                                        )}
                                        {contact?.tags && contact.tags.length > 0 && (
                                            <div className="flex items-start gap-2 pt-1">
                                                <Tag className="w-3.5 h-3.5 text-platinum/40 flex-shrink-0 mt-0.5" />
                                                <div className="flex flex-wrap gap-1">
                                                    {contact.tags.map(tag => (
                                                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/8 rounded-full text-platinum/70 border border-white/10">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {contact?.notes && (
                                            <div className="flex items-start gap-2 pt-1">
                                                <FileText className="w-3.5 h-3.5 text-platinum/40 flex-shrink-0 mt-0.5" />
                                                <p className="text-platinum/60 text-sm leading-relaxed">{contact.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Assigned */}
                    {deal.assignedUser && (
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-3.5 h-3.5 text-platinum/40" />
                            <span className="text-platinum/50">Atendente:</span>
                            <span className="text-platinum/80">{deal.assignedUser.name}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {deal.contact && (
                    <div className="px-5 py-4 border-t border-white/8 flex gap-3">
                        <Link
                            href={`/crm/contacts/${deal.contact.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-platinum/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Ver perfil completo
                        </Link>
                        <Link
                            href={`/crm/conversations?contact=${deal.contact.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold hover:bg-gold/15 transition-all text-sm font-medium"
                        >
                            Ver conversa
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

function ContactAvatarLg({ contact }: { contact: Deal['contact'] }) {
    const [imgError, setImgError] = useState(false)
    const initials = contact?.name
        ? contact.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'

    if (contact?.profilePictureUrl && !imgError) {
        return (
            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                <Image src={contact.profilePictureUrl} alt={contact.name} width={44} height={44} className="w-full h-full object-cover" onError={() => setImgError(true)} />
            </div>
        )
    }
    return (
        <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ring-2 ring-white/10 bg-gradient-to-br from-gold/30 to-gold/10 text-gold">
            {initials}
        </div>
    )
}

function ContactAvatar({ contact }: { contact: Deal['contact'] }) {
    const [imgError, setImgError] = useState(false)
    const initials = contact?.name
        ? contact.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'

    if (contact?.profilePictureUrl && !imgError) {
        return (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                <Image
                    src={contact.profilePictureUrl}
                    alt={contact.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            </div>
        )
    }

    return (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ring-2 ring-white/10 bg-gradient-to-br from-gold/30 to-gold/10 text-gold">
            {initials}
        </div>
    )
}

export default function PipelinePage() {
    const [stages, setStages] = useState<PipelineStage[]>([])
    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [draggedDeal, setDraggedDeal] = useState<string | null>(null)
    const [dragOverStage, setDragOverStage] = useState<string | null>(null)
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const loadData = useCallback(async () => {
        try {
            const [stagesRes, dealsRes] = await Promise.all([
                fetch('/api/crm/pipeline/stages'),
                fetch('/api/crm/deals'),
            ])
            const stagesData = await stagesRes.json()
            const dealsData = await dealsRes.json()
            setStages(stagesData.data || [])
            setDeals(dealsData.data || [])
        } catch (error) {
            console.error('Error loading pipeline:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const checkScroll = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }, [])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        checkScroll()
        el.addEventListener('scroll', checkScroll)
        window.addEventListener('resize', checkScroll)
        return () => {
            el.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
        }
    }, [checkScroll, stages])

    const scroll = (dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
    }

    const getDealsForStage = (stageId: string) =>
        deals.filter(d => d.stage?.id === stageId)

    const getStageTotalValue = (stageId: string) => {
        const total = getDealsForStage(stageId).reduce((sum, d) => sum + (d.value ?? 0), 0)
        return total > 0 ? (total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) : null
    }

    const handleDragStart = (dealId: string) => setDraggedDeal(dealId)

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault()
        setDragOverStage(stageId)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if leaving the column entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverStage(null)
        }
    }

    const handleDrop = async (e: React.DragEvent, stageId: string) => {
        e.preventDefault()
        setDragOverStage(null)

        if (!draggedDeal) return

        setDeals(prev => prev.map(d =>
            d.id === draggedDeal
                ? { ...d, stage: stages.find(s => s.id === stageId) ? { ...stages.find(s => s.id === stageId)! } : d.stage }
                : d
        ))

        try {
            await fetch(`/api/crm/deals/${draggedDeal}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stageId }),
            })
        } catch {
            loadData()
        }

        setDraggedDeal(null)
    }

    const handleDragEnd = () => {
        setDraggedDeal(null)
        setDragOverStage(null)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse h-8 bg-white/10 rounded w-1/3" />
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse h-96 bg-white/10 rounded-2xl w-72 flex-shrink-0" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pipeline</h1>
                    <p className="text-platinum/60 text-sm mt-0.5">{deals.length} deals ativos</p>
                </div>

                {/* Scroll arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-platinum/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-platinum/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Deal Detail Modal */}
            <AnimatePresence>
                {selectedDeal && (
                    <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
                )}
            </AnimatePresence>

            {/* Kanban Board */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 flex-1 scroll-smooth"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                }}
            >
                {stages.map((stage, index) => {
                    const stageDeals = getDealsForStage(stage.id)
                    const totalValue = getStageTotalValue(stage.id)
                    const isOver = dragOverStage === stage.id
                    const stageColor = stage.color || '#666666'

                    return (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex-shrink-0 w-72 flex flex-col"
                            onDragOver={(e) => handleDragOver(e, stage.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, stage.id)}
                        >
                            {/* Column Header */}
                            <div
                                className="rounded-xl mb-2 px-3 py-2.5 border"
                                style={{
                                    backgroundColor: `${stageColor}15`,
                                    borderColor: `${stageColor}30`,
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: stageColor }}
                                        />
                                        <span className="text-white font-semibold text-sm">{stage.name}</span>
                                    </div>
                                    <span
                                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: `${stageColor}25`,
                                            color: stageColor,
                                        }}
                                    >
                                        {stageDeals.length}
                                    </span>
                                </div>
                                {totalValue && (
                                    <div className="flex items-center gap-1 mt-1.5">
                                        <DollarSign className="w-3 h-3 text-platinum/40" />
                                        <span className="text-platinum/60 text-[11px]">{totalValue}</span>
                                    </div>
                                )}
                            </div>

                            {/* Column Body */}
                            <div
                                className={cn(
                                    'rounded-2xl border p-3 flex-1 min-h-[400px] space-y-2.5 transition-all duration-150',
                                    isOver
                                        ? 'border-dashed bg-charcoal/80'
                                        : 'bg-charcoal/40 border-white/5'
                                )}
                                style={isOver ? { borderColor: `${stageColor}60`, backgroundColor: `${stageColor}08` } : {}}
                            >
                                {stageDeals.length > 0 ? (
                                    stageDeals.map(deal => (
                                        <motion.div
                                            key={deal.id}
                                            layout
                                            draggable
                                            onDragStart={() => handleDragStart(deal.id)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => { if (!draggedDeal) setSelectedDeal(deal) }}
                                            className={cn(
                                                'bg-[#1a1a1a] rounded-xl p-3.5 border border-white/8 cursor-pointer active:cursor-grabbing',
                                                'hover:border-white/20 hover:shadow-lg hover:shadow-black/30',
                                                'transition-all duration-150 group',
                                                draggedDeal === deal.id && 'opacity-40 scale-95'
                                            )}
                                        >
                                            {/* Deal title */}
                                            <p className="text-white font-medium text-sm leading-snug mb-2.5 group-hover:text-white/90">
                                                {deal.title}
                                            </p>

                                            {/* Contact */}
                                            {deal.contact && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ContactAvatar contact={deal.contact} />
                                                    <div className="min-w-0">
                                                        <p className="text-white/80 text-xs font-medium truncate">{deal.contact.name}</p>
                                                        {deal.contact.company && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Building2 className="w-2.5 h-2.5 text-platinum/40 flex-shrink-0" />
                                                                <p className="text-platinum/50 text-[10px] truncate">{deal.contact.company}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    {deal.planInterest && (
                                                        <span className="text-gold text-[10px] font-semibold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/15">
                                                            {deal.planInterest}
                                                        </span>
                                                    )}
                                                    {deal.contact?.leadScore && (
                                                        <PipelineLeadScore score={deal.contact.leadScore} />
                                                    )}
                                                </div>
                                                {deal.value != null && (
                                                    <span className="text-emerald-400 text-xs font-bold">
                                                        {(deal.value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div
                                        className={cn(
                                            'flex flex-col items-center justify-center h-24 gap-2 rounded-xl border border-dashed',
                                            isOver ? 'border-current' : 'border-white/10'
                                        )}
                                        style={isOver ? { borderColor: `${stageColor}50`, color: stageColor } : {}}
                                    >
                                        {isOver ? (
                                            <p className="text-xs font-medium">Soltar aqui</p>
                                        ) : (
                                            <p className="text-platinum/25 text-xs">Sem deals</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
