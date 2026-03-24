'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Sparkles,
    Loader2,
    FileText,
    Copy,
    Check,
    RefreshCw,
    Save,
} from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
}

interface GeneratedPost {
    title: string
    excerpt: string
    content: string
    tags: string[]
    readingTime: number
}

export default function AIGeneratorPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [generating, setGenerating] = useState(false)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)
    const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null)
    const [selectedCategoryId, setSelectedCategoryId] = useState('')

    const [formData, setFormData] = useState({
        topic: '',
        category: '',
        tone: 'formal' as 'formal' | 'casual' | 'tecnico' | 'inspiracional',
        targetAudience: 'geral' as 'pacientes' | 'empresas' | 'rh' | 'geral',
        length: 'medio' as 'curto' | 'medio' | 'longo',
        keywords: '',
    })

    useEffect(() => {
        fetch('/api/categories')
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch(console.error)
    }, [])

    const handleGenerate = async () => {
        if (!formData.topic.trim()) {
            alert('Digite um tema para o post')
            return
        }

        setGenerating(true)
        setGeneratedPost(null)

        try {
            const res = await fetch('/api/ai/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: formData.topic,
                    category: formData.category,
                    tone: formData.tone,
                    targetAudience: formData.targetAudience,
                    length: formData.length,
                    keywords: formData.keywords
                        ? formData.keywords.split(',').map((k) => k.trim())
                        : undefined,
                }),
            })

            const data = await res.json()

            if (res.ok && data.post) {
                setGeneratedPost(data.post)
            } else {
                alert(data.error || 'Erro ao gerar conteúdo')
            }
        } catch (error) {
            console.error('Error generating post:', error)
            alert('Erro ao gerar conteúdo')
        } finally {
            setGenerating(false)
        }
    }

    const handleCopyContent = () => {
        if (generatedPost) {
            navigator.clipboard.writeText(generatedPost.content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleSaveAsPost = async () => {
        if (!generatedPost) return

        setSaving(true)

        try {
            const slug = generatedPost.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')

            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: generatedPost.title,
                    slug,
                    excerpt: generatedPost.excerpt,
                    content: generatedPost.content,
                    categoryId: selectedCategoryId || undefined,
                    status: 'draft',
                    aiGenerated: true,
                    tags: generatedPost.tags,
                }),
            })

            if (res.ok) {
                const data = await res.json()
                router.push(`/admin/posts/${data.post.id}/edit`)
            } else {
                const error = await res.json()
                alert(error.error || 'Erro ao salvar post')
            }
        } catch (error) {
            console.error('Error saving post:', error)
            alert('Erro ao salvar post')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-gold" />
                    Gerador de Posts com IA
                </h1>
                <p className="text-platinum mt-1">
                    Use inteligência artificial para criar conteúdo de qualidade
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-charcoal rounded-2xl p-6 border border-white/10 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Configurações</h2>

                    {/* Topic */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Tema do Post *
                        </label>
                        <textarea
                            value={formData.topic}
                            onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
                            placeholder="Ex: Benefícios da telemedicina para empresas"
                            rows={3}
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Categoria
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, category: e.target.value }))
                                const cat = categories.find((c) => c.slug === e.target.value)
                                setSelectedCategoryId(cat?.id || '')
                            }}
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                        >
                            <option value="">Geral</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tone */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Tom de Voz
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'formal', label: 'Formal', desc: 'Profissional' },
                                { value: 'casual', label: 'Casual', desc: 'Amigável' },
                                { value: 'tecnico', label: 'Técnico', desc: 'Detalhado' },
                                { value: 'inspiracional', label: 'Inspiracional', desc: 'Motivacional' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, tone: option.value as typeof prev.tone }))}
                                    className={`p-3 rounded-xl border text-left transition-all ${formData.tone === option.value
                                            ? 'bg-gold/10 border-gold/50 text-gold'
                                            : 'bg-black-deep border-white/10 text-white hover:border-white/20'
                                        }`}
                                >
                                    <p className="font-medium">{option.label}</p>
                                    <p className="text-xs text-platinum">{option.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Público-alvo
                        </label>
                        <select
                            value={formData.targetAudience}
                            onChange={(e) => setFormData((prev) => ({ ...prev, targetAudience: e.target.value as typeof prev.targetAudience }))}
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
                        >
                            <option value="geral">Público Geral</option>
                            <option value="pacientes">Pacientes e Beneficiários</option>
                            <option value="empresas">Gestores de Empresas</option>
                            <option value="rh">Profissionais de RH</option>
                        </select>
                    </div>

                    {/* Length */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Tamanho do Artigo
                        </label>
                        <div className="flex gap-3">
                            {[
                                { value: 'curto', label: 'Curto', desc: '~500 palavras' },
                                { value: 'medio', label: 'Médio', desc: '~1000 palavras' },
                                { value: 'longo', label: 'Longo', desc: '~2000 palavras' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, length: option.value as typeof prev.length }))}
                                    className={`flex-1 p-3 rounded-xl border text-center transition-all ${formData.length === option.value
                                            ? 'bg-gold/10 border-gold/50 text-gold'
                                            : 'bg-black-deep border-white/10 text-white hover:border-white/20'
                                        }`}
                                >
                                    <p className="font-medium">{option.label}</p>
                                    <p className="text-xs text-platinum">{option.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Keywords */}
                    <div>
                        <label className="block text-sm font-medium text-platinum mb-2">
                            Palavras-chave (opcional)
                        </label>
                        <input
                            type="text"
                            value={formData.keywords}
                            onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                            placeholder="saúde, prevenção, bem-estar"
                            className="w-full px-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                        />
                        <p className="text-platinum text-xs mt-1">Separe por vírgulas</p>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={generating || !formData.topic.trim()}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Gerando conteúdo...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Gerar com IA
                            </>
                        )}
                    </button>
                </div>

                {/* Preview */}
                <div className="bg-charcoal rounded-2xl p-6 border border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Preview</h2>
                        {generatedPost && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="flex items-center gap-2 px-3 py-2 text-platinum hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                                    Regenerar
                                </button>
                                <button
                                    onClick={handleCopyContent}
                                    className="flex items-center gap-2 px-3 py-2 text-platinum hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                            </div>
                        )}
                    </div>

                    {generatedPost ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {/* Title */}
                            <div>
                                <p className="text-platinum text-xs uppercase tracking-wide mb-1">Título</p>
                                <h3 className="text-xl font-bold text-white">{generatedPost.title}</h3>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <p className="text-platinum text-xs uppercase tracking-wide mb-1">Resumo</p>
                                <p className="text-white/80">{generatedPost.excerpt}</p>
                            </div>

                            {/* Tags */}
                            <div>
                                <p className="text-platinum text-xs uppercase tracking-wide mb-2">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {generatedPost.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-gold/10 text-gold rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Reading Time */}
                            <p className="text-platinum text-sm">
                                ⏱ Tempo de leitura: {generatedPost.readingTime} min
                            </p>

                            {/* Content Preview */}
                            <div>
                                <p className="text-platinum text-xs uppercase tracking-wide mb-2">Conteúdo</p>
                                <div
                                    className="prose prose-invert prose-sm max-h-64 overflow-y-auto bg-black-deep p-4 rounded-xl"
                                    dangerouslySetInnerHTML={{ __html: generatedPost.content }}
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveAsPost}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-green-500/20 text-green-400 font-semibold rounded-xl hover:bg-green-500/30 disabled:opacity-50 transition-colors"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Salvar como Rascunho
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="w-12 h-12 text-platinum/30 mb-4" />
                            <p className="text-platinum">
                                {generating
                                    ? 'Gerando conteúdo com IA...'
                                    : 'Configure as opções e clique em "Gerar com IA"'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
