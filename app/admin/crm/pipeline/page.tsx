'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, User, Target, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

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
    contact: { id: string; name: string; phone: string; company: string | null } | null
    stage: { id: string; name: string; slug: string; color: string | null; order: number } | null
    assignedUser: { id: string; name: string } | null
}

export default function PipelinePage() {
    const [stages, setStages] = useState<PipelineStage[]>([])
    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [draggedDeal, setDraggedDeal] = useState<string | null>(null)

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

    const getDealsForStage = (stageId: string) =>
        deals.filter(d => d.stage?.id === stageId)

    const handleDragStart = (dealId: string) => {
        setDraggedDeal(dealId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.currentTarget.classList.add('bg-gold/5')
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('bg-gold/5')
    }

    const handleDrop = async (e: React.DragEvent, stageId: string) => {
        e.preventDefault()
        e.currentTarget.classList.remove('bg-gold/5')

        if (!draggedDeal) return

        // Optimistic update
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
            // Revert on error
            loadData()
        }

        setDraggedDeal(null)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse h-8 bg-white/10 rounded w-1/3" />
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse h-96 bg-white/10 rounded-2xl flex-1" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Pipeline</h1>
                    <p className="text-platinum mt-1">{deals.length} deals no pipeline</p>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4">
                {stages.map((stage, index) => {
                    const stageDeals = getDealsForStage(stage.id)

                    return (
                        <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex-shrink-0 w-72"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, stage.id)}
                        >
                            {/* Column Header */}
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: stage.color || '#666' }}
                                />
                                <span className="text-white font-medium text-sm">{stage.name}</span>
                                <span className="text-platinum/50 text-xs ml-auto bg-white/5 px-2 py-0.5 rounded-full">
                                    {stageDeals.length}
                                </span>
                            </div>

                            {/* Column Body */}
                            <div className="bg-charcoal/50 rounded-2xl border border-white/5 p-3 min-h-[400px] space-y-3 transition-colors">
                                {stageDeals.length > 0 ? (
                                    stageDeals.map(deal => (
                                        <div
                                            key={deal.id}
                                            draggable
                                            onDragStart={() => handleDragStart(deal.id)}
                                            className={cn(
                                                'bg-charcoal rounded-xl p-4 border border-white/10 cursor-grab active:cursor-grabbing hover:border-gold/20 transition-all',
                                                draggedDeal === deal.id && 'opacity-50'
                                            )}
                                        >
                                            <p className="text-white font-medium text-sm truncate">{deal.title}</p>

                                            {deal.contact && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <User className="w-3 h-3 text-platinum" />
                                                    <span className="text-platinum text-xs truncate">{deal.contact.name}</span>
                                                </div>
                                            )}

                                            {deal.contact?.company && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Building2 className="w-3 h-3 text-platinum" />
                                                    <span className="text-platinum text-xs truncate">{deal.contact.company}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                                                {deal.planInterest && (
                                                    <span className="text-gold text-[10px] font-medium bg-gold/10 px-2 py-0.5 rounded">
                                                        {deal.planInterest}
                                                    </span>
                                                )}
                                                {deal.value != null && (
                                                    <span className="text-green-400 text-xs font-medium ml-auto">
                                                        R$ {(deal.value / 100).toLocaleString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-24 text-platinum/30 text-xs">
                                        Arraste deals aqui
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
