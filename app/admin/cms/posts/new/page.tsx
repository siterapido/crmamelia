'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    Loader2,
    ImageIcon,
    Sparkles,
    Tag,
    X,
} from 'lucide-react'
import Link from 'next/link'

interface Category {
    id: string
    name: string
    slug: string
    color: string
}

export default function NewPostPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [tagInput, setTagInput] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        categoryId: '',
        status: 'draft' as 'draft' | 'published',
        featured: false,
        tags: [] as string[],
        aiGenerated: false,
    })

    useEffect(() => {
        fetch('/api/categories')
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch(console.error)
    }, [])

    // Auto-generate slug from title
    useEffect(() => {
        if (formData.title && !formData.slug) {
            const slug = formData.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            setFormData((prev) => ({ ...prev, slug }))
        }
    }, [formData.title])

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
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                const data = await res.json()
                router.push(`/admin/cms/posts/${data.post.id}/edit`)
            } else {
                const error = await res.json()
                alert(error.error || 'Erro ao criar post')
            }
        } catch (error) {
            console.error('Error creating post:', error)
            alert('Erro ao criar post')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/cms/posts"
                    className="p-2 rounded-lg bg-charcoal text-platinum hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Novo Post</h1>
                    <p className="text-platinum mt-1">Crie um novo artigo para o blog</p>
                </div>
            </div>

            {/* AI Generator Link */}
            <Link
                href="/admin/cms/ai-generator"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-gold/10 to-gold-light/10 border border-gold/30 rounded-xl hover:border-gold/50 transition-colors"
            >
                <Sparkles className="w-6 h-6 text-gold" />
                <div>
                    <p className="text-white font-medium">Gerar com IA</p>
                    <p className="text-platinum text-sm">Use inteligência artificial para criar conteúdo</p>
                </div>
            </Link>

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
                            placeholder="Digite o título do post"
                            required
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
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
                            placeholder="meu-post-incrivel"
                            required
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
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
                            placeholder="Breve descrição do post"
                            rows={3}
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
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
                            placeholder="Escreva o conteúdo do post em HTML..."
                            rows={12}
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-none font-mono text-sm"
                        />
                        <p className="text-platinum text-xs mt-2">
                            Suporte a HTML: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                        </p>
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Imagem de Capa (URL)
                        </label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                                <input
                                    type="url"
                                    value={formData.coverImage}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                    className="w-full pl-12 pr-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-platinum mb-2">
                                Categoria
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
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
                                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                                className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                            >
                                <option value="draft">Rascunho</option>
                                <option value="published">Publicado</option>
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
                                Criar Post
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
