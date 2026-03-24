'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Building2, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

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
    } | null
    stage: { id: string; name: string; slug: string; color: string | null; order: number } | null
    assignedUser: { id: string; name: string } | null
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
                                            className={cn(
                                                'bg-[#1a1a1a] rounded-xl p-3.5 border border-white/8 cursor-grab active:cursor-grabbing',
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
                                                {deal.planInterest ? (
                                                    <span className="text-gold text-[10px] font-semibold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/15">
                                                        {deal.planInterest}
                                                    </span>
                                                ) : <span />}
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
