'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    Sparkles,
    FileText,
    Loader2,
} from 'lucide-react'

interface Post {
    id: string
    title: string
    slug: string
    excerpt: string
    status: string
    aiGenerated: boolean
    featured: boolean
    createdAt: string
    publishedAt: string | null
    category: { id: string; name: string; color: string } | null
    author: { id: string; name: string } | null
}

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const loadPosts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            })
            if (searchQuery) params.set('search', searchQuery)
            if (statusFilter !== 'all') params.set('status', statusFilter)

            const res = await fetch(`/api/posts?${params}`)
            const data = await res.json()
            setPosts(data.data || [])
            setTotalPages(data.totalPages || 1)
        } catch (error) {
            console.error('Error loading posts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPosts()
    }, [page, statusFilter])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        loadPosts()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este post?')) return

        try {
            const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
            if (res.ok) {
                loadPosts()
            }
        } catch (error) {
            console.error('Error deleting post:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Posts</h1>
                    <p className="text-platinum mt-1">Gerencie os posts do blog</p>
                </div>
                <Link
                    href="/admin/cms/posts/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Novo Post
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar posts..."
                            className="w-full pl-12 pr-4 py-3 bg-charcoal border border-white/10 rounded-xl text-white placeholder:text-platinum focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>
                </form>

                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-platinum" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setPage(1)
                        }}
                        className="px-4 py-3 bg-charcoal border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                    >
                        <option value="all">Todos</option>
                        <option value="published">Publicados</option>
                        <option value="draft">Rascunhos</option>
                        <option value="archived">Arquivados</option>
                    </select>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-charcoal rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-gold animate-spin" />
                    </div>
                ) : posts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-6 py-4 text-platinum text-sm font-medium">Título</th>
                                    <th className="text-left px-6 py-4 text-platinum text-sm font-medium">Categoria</th>
                                    <th className="text-left px-6 py-4 text-platinum text-sm font-medium">Status</th>
                                    <th className="text-left px-6 py-4 text-platinum text-sm font-medium">Data</th>
                                    <th className="text-right px-6 py-4 text-platinum text-sm font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post, index) => (
                                    <motion.tr
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {post.aiGenerated ? (
                                                        <Sparkles className="w-5 h-5 text-gold" />
                                                    ) : (
                                                        <FileText className="w-5 h-5 text-gold" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium truncate max-w-xs">
                                                        {post.title}
                                                    </p>
                                                    <p className="text-platinum text-sm truncate max-w-xs">
                                                        /{post.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {post.category ? (
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor: `${post.category.color}20`,
                                                        color: post.category.color,
                                                    }}
                                                >
                                                    {post.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-platinum text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${post.status === 'published'
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : post.status === 'draft'
                                                            ? 'bg-yellow-500/10 text-yellow-400'
                                                            : 'bg-gray-500/10 text-gray-400'
                                                    }`}
                                            >
                                                {post.status === 'published' ? 'Publicado' : post.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-platinum text-sm">
                                            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    className="p-2 rounded-lg text-platinum hover:text-white hover:bg-white/10 transition-colors"
                                                    title="Ver no blog"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/posts/${post.id}/edit`}
                                                    className="p-2 rounded-lg text-platinum hover:text-gold hover:bg-gold/10 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 rounded-lg text-platinum hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-platinum/50 mx-auto mb-3" />
                        <p className="text-white font-medium">Nenhum post encontrado</p>
                        <p className="text-platinum text-sm mt-1">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Tente ajustar os filtros'
                                : 'Crie seu primeiro post para começar'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-charcoal text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2 text-platinum">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg bg-charcoal text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    )
}
