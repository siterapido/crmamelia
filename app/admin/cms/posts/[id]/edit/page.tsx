'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    Loader2,
    ImageIcon,
    Tag,
    X,
    Trash2,
} from 'lucide-react'
import Link from 'next/link'

interface Category {
    id: string
    name: string
    slug: string
    color: string
}

interface Post {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    coverImage: string
    categoryId: string | null
    status: string
    featured: boolean
    aiGenerated: boolean
    tags: string[]
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [tagInput, setTagInput] = useState('')

    const [formData, setFormData] = useState<Post>({
        id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        categoryId: null,
        status: 'draft',
        featured: false,
        aiGenerated: false,
        tags: [],
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const [postRes, categoriesRes] = await Promise.all([
                    fetch(`/api/posts/${id}`),
                    fetch('/api/categories'),
                ])

                if (postRes.ok) {
                    const post = await postRes.json()
                    setFormData({
                        id: post.id,
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt || '',
                        content: post.content || '',
                        coverImage: post.coverImage || '',
                        categoryId: post.category?.id || null,
                        status: post.status,
                        featured: post.featured,
                        aiGenerated: post.aiGenerated,
                        tags: post.tags || [],
                    })
                }

                if (categoriesRes.ok) {
                    const cats = await categoriesRes.json()
                    setCategories(cats)
                }
            } catch (error) {
                console.error('Error loading post:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [id])

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }))
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch(`/api/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    slug: formData.slug,
                    excerpt: formData.excerpt,
                    content: formData.content,
                    coverImage: formData.coverImage,
                    categoryId: formData.categoryId,
                    status: formData.status,
                    featured: formData.featured,
                    tags: formData.tags,
                }),
            })

            if (res.ok) {
                router.push('/admin/cms/posts')
            } else {
                const error = await res.json()
                alert(error.error || 'Erro ao atualizar post')
            }
        } catch (error) {
            console.error('Error updating post:', error)
            alert('Erro ao atualizar post')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este post?')) return

        try {
            const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
            if (res.ok) {
                router.push('/admin/cms/posts')
            } else {
                alert('Erro ao excluir post')
            }
        } catch (error) {
            console.error('Error deleting post:', error)
            alert('Erro ao excluir post')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/cms/posts"
                        className="p-2 rounded-lg bg-charcoal text-platinum hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Editar Post</h1>
                        <p className="text-platinum mt-1">
                            {formData.aiGenerated && (
                                <span className="text-gold">✨ Gerado por IA • </span>
                            )}
                            Última edição
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                    Excluir
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-charcoal rounded-2xl p-6 border border-white/10 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Título *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                            required
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Slug (URL) *
                        </label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                            required
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Resumo
                        </label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors resize-none"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Conteúdo
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                            rows={12}
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors resize-none font-mono text-sm"
                        />
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Imagem de Capa (URL)
                        </label>
                        <div className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                            <input
                                type="url"
                                value={formData.coverImage}
                                onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                                className="w-full pl-12 pr-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                            />
                        </div>
                    </div>

                    {/* Category & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-platinum mb-2">
                                Categoria
                            </label>
                            <select
                                value={formData.categoryId || ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value || null }))}
                                className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                            >
                                <option value="">Selecione...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-platinum mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                                className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                            >
                                <option value="draft">Rascunho</option>
                                <option value="published">Publicado</option>
                                <option value="archived">Arquivado</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Tags
                        </label>
                        <div className="flex gap-2 mb-3">
                            <div className="relative flex-1">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder="Digite uma tag e pressione Enter"
                                    className="w-full pl-12 pr-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="px-4 py-3 bg-gold/10 text-gold rounded-xl hover:bg-gold/20 transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <motion.span
                                        key={tag}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold rounded-lg text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Featured */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                            className="w-5 h-5 rounded border-white/10 bg-black-deep text-gold focus:ring-gold"
                        />
                        <span className="text-white">Destacar este post</span>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/admin/cms/posts"
                        className="px-6 py-3 rounded-xl text-platinum hover:text-white transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
