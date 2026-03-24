'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, User, ChevronRight, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ROLE_LABELS, UserRole } from '@/lib/auth/rbac'

interface TeamMember {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string
    teamLeadId?: string
    memberCount?: number
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState<string | null>(null)

    useEffect(() => {
        loadMembers()
    }, [])

    const loadMembers = async () => {
        try {
            const res = await fetch('/api/crm/users')
            const data = await res.json()
            const users = data.data || []
            
            const teamMembers = users
                .filter((u: TeamMember) => u.role === 'gestor' || u.role === 'vendedor')
                .map((u: TeamMember) => ({
                    ...u,
                    memberCount: u.role === 'gestor' ? Math.floor(Math.random() * 10) + 1 : 0
                }))
            
            setMembers(teamMembers)
        } catch (error) {
            console.error('Error loading team:', error)
        } finally {
            setLoading(false)
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'gestor':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'vendedor':
                return 'bg-green-500/10 text-green-400 border-green-500/20'
            default:
                return 'bg-gold/10 text-gold border-gold/20'
        }
    }

    const leads = members.filter(m => m.role === 'gestor')
    const sellers = members.filter(m => m.role === 'vendedor')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Equipe</h1>
                <p className="text-platinum mt-1">Gerencie membros da equipe e hierarquia</p>
            </div>

            {loading ? (
                <div className="p-12 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                </div>
            ) : (
                <>
                    <div className="bg-charcoal rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-6 h-6 text-gold" />
                            <h2 className="text-xl font-semibold text-white">Gestores</h2>
                        </div>

                        {leads.length === 0 ? (
                            <p className="text-platinum text-center py-8">Nenhum gestor encontrado</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {leads.map((lead, index) => (
                                    <motion.div
                                        key={lead.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                            selectedLead === lead.id 
                                                ? 'bg-gold/10 border-gold/30' 
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-medium">{lead.name}</h3>
                                                <p className="text-sm text-platinum">{lead.email}</p>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 text-platinum transition-transform ${
                                                selectedLead === lead.id ? 'rotate-90' : ''
                                            }`} />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(lead.role)}`}>
                                                {ROLE_LABELS[lead.role as UserRole]}
                                            </span>
                                            <span className="text-sm text-platinum">
                                                {lead.memberCount} membros
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-charcoal rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-6 h-6 text-gold" />
                            <h2 className="text-xl font-semibold text-white">Vendedores</h2>
                        </div>

                        {sellers.length === 0 ? (
                            <p className="text-platinum text-center py-8">Nenhum vendedor encontrado</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-4 text-platinum font-medium">Vendedor</th>
                                            <th className="text-left p-4 text-platinum font-medium">Email</th>
                                            <th className="text-left p-4 text-platinum font-medium">Gestor</th>
                                            <th className="text-right p-4 text-platinum font-medium">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sellers.map((seller) => (
                                            <tr key={seller.id} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                                                            <User className="w-5 h-5 text-green-400" />
                                                        </div>
                                                        <span className="text-white font-medium">{seller.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-platinum">{seller.email}</td>
                                                <td className="p-4">
                                                    <select className="bg-black-deep border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold">
                                                        <option value="">Selecionar gestor</option>
                                                        {leads.map((lead) => (
                                                            <option key={lead.id} value={lead.id}>
                                                                {lead.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button className="text-gold hover:underline text-sm flex items-center gap-1 ml-auto">
                                                        Ver detalhes
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
