'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Eye, PenSquare, FolderOpen, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Stats {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    categories: number
}

interface Post {
    id: string
    title: string
    status: string
    createdAt: string
    aiGenerated: boolean
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        categories: 0,
    })
    const [recentPosts, setRecentPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [postsRes, categoriesRes] = await Promise.all([
                    fetch('/api/posts?limit=5'),
                    fetch('/api/categories'),
                ])

                const postsData = await postsRes.json()
                const categoriesData = await categoriesRes.json()

                setStats({
                    totalPosts: postsData.total || 0,
                    publishedPosts: postsData.data?.filter((p: Post) => p.status === 'published').length || 0,
                    draftPosts: postsData.data?.filter((p: Post) => p.status === 'draft').length || 0,
                    categories: categoriesData.length || 0,
                })

                setRecentPosts(postsData.data || [])
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const statCards = [
        { label: 'Total de Posts', value: stats.totalPosts, icon: FileText, color: 'gold' },
        { label: 'Publicados', value: stats.publishedPosts, icon: Eye, color: 'green' },
        { label: 'Rascunhos', value: stats.draftPosts, icon: PenSquare, color: 'blue' },
        { label: 'Categorias', value: stats.categories, icon: FolderOpen, color: 'purple' },
    ]

    const colorClasses = {
        gold: 'bg-gold/10 text-gold border-gold/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-platinum mt-1">Visão geral do seu blog</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    <PenSquare className="w-5 h-5" />
                    Novo Post
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-charcoal rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-platinum text-sm">{stat.label}</p>
                                <p className="text-4xl font-bold text-white mt-2">
                                    {loading ? '-' : stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl border ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Posts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-charcoal rounded-2xl p-6 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gold" />
                            Posts Recentes
                        </h2>
                        <Link
                            href="/admin/posts"
                            className="text-gold text-sm hover:underline"
                        >
                            Ver todos
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-white/10 rounded w-3/4" />
                                        <div className="h-3 bg-white/10 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentPosts.length > 0 ? (
                        <div className="space-y-4">
                            {recentPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/admin/posts/${post.id}/edit`}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                                        {post.aiGenerated ? (
                                            <Sparkles className="w-5 h-5 text-gold" />
                                        ) : (
                                            <FileText className="w-5 h-5 text-gold" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate group-hover:text-gold transition-colors">
                                            {post.title}
                                        </p>
                                        <p className="text-platinum text-sm">
                                            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${post.status === 'published'
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-yellow-500/10 text-yellow-400'
                                            }`}
                                    >
                                        {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-platinum/50 mx-auto mb-3" />
                            <p className="text-platinum">Nenhum post ainda</p>
                            <Link
                                href="/admin/posts/new"
                                className="text-gold text-sm hover:underline"
                            >
                                Criar primeiro post
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-charcoal rounded-2xl p-6 border border-white/10"
                >
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold" />
                        Ações Rápidas
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/admin/posts/new"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group"
                        >
                            <PenSquare className="w-8 h-8 text-platinum group-hover:text-gold transition-colors" />
                            <span className="text-white font-medium text-center">Novo Post</span>
                        </Link>

                        <Link
                            href="/admin/ai-generator"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group"
                        >
                            <Sparkles className="w-8 h-8 text-platinum group-hover:text-gold transition-colors" />
                            <span className="text-white font-medium text-center">Gerar com IA</span>
                        </Link>

                        <Link
                            href="/admin/categories"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group"
                        >
                            <FolderOpen className="w-8 h-8 text-platinum group-hover:text-gold transition-colors" />
                            <span className="text-white font-medium text-center">Categorias</span>
                        </Link>

                        <Link
                            href="/blog"
                            target="_blank"
                            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-all group"
                        >
                            <Eye className="w-8 h-8 text-platinum group-hover:text-gold transition-colors" />
                            <span className="text-white font-medium text-center">Ver Blog</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
