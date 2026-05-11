'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, MessageCircle } from 'lucide-react'
import type { NewsArticle, NewsCategory } from '@/lib/types/news'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

interface BlogSidebarProps {
    popularArticles: NewsArticle[]
    categories: NewsCategory[]
    loading?: boolean
}

/**
 * Blog Sidebar Component
 * Popular articles, categories, and CTA
 */
export const BlogSidebar: React.FC<BlogSidebarProps> = ({
    popularArticles,
    categories,
    loading = false,
}) => {
    if (loading) {
        return (
            <aside className="space-y-8">
                <div className="rounded-card bg-black-charcoal border border-gray-border p-6 animate-pulse">
                    <div className="h-6 bg-gray-dark rounded w-3/4 mb-4" />
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-dark rounded" />
                        ))}
                    </div>
                </div>
            </aside>
        )
    }

    return (
        <aside className="space-y-8 lg:sticky lg:top-32">
            {/* Popular Articles */}
            <div className="rounded-card bg-black-charcoal/60 backdrop-blur-sm border border-gray-border p-6 glass-dark">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-gold-primary" />
                    <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">
                        Mais Lidos
                    </h3>
                </div>

                <div className="space-y-4">
                    {popularArticles.slice(0, 5).map((article, index) => (
                        <Link
                            key={article.id}
                            href={`/blog/${article.slug}`}
                            className="group block"
                        >
                            <article className="flex gap-4 p-3 rounded-premium hover:bg-black-elevated/50 transition-colors duration-300">
                                {/* Number */}
                                <div className="flex-shrink-0">
                                    <div className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                                        index === 0 ? 'bg-gold-primary text-black-premium' : 'bg-gray-dark text-platinum'
                                    )}>
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white text-sm line-clamp-2 mb-1 group-hover:text-gold-signature transition-colors">
                                        {article.title}
                                    </h4>
                                    <p className="text-xs text-platinum">
                                        {article.readingTime} min
                                    </p>
                                </div>

                                {/* Thumbnail */}
                                {article.coverImage && (
                                    <div className="flex-shrink-0 relative w-16 h-16 rounded-card overflow-hidden">
                                        <Image
                                            src={article.coverImage}
                                            alt={article.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                            </article>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="rounded-card bg-black-charcoal/60 backdrop-blur-sm border border-gray-border p-6 glass-dark">
                <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider mb-6">
                    Categorias
                </h3>

                <div className="space-y-2">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/blog?categoria=${category.slug}`}
                            className="flex items-center justify-between p-3 rounded-premium hover:bg-black-elevated/50 transition-colors duration-300 group"
                        >
                            <span className="text-platinum group-hover:text-white transition-colors">
                                {category.name}
                            </span>
                            <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-gold-primary" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* CTA WhatsApp */}
            <div className="rounded-card bg-gradient-gold-section p-8 text-center pattern-shield grain-gold relative overflow-hidden">
                <div className="relative z-10">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-black-premium" />
                    <h3 className="font-display font-bold text-black-premium text-xl mb-2">
                        Precisa de Ajuda?
                    </h3>
                    <p className="text-black-premium/80 text-sm mb-6">
                        Fale com nossa equipe no WhatsApp
                    </p>
                    <Button
                        variant="secondary"
                        size="base"
                        className="!bg-black-premium !text-gold-primary hover:!bg-black-deep shadow-premium w-full"
                        onClick={() => {
                            const phoneNumber = '5511999999999'
                            const message = 'Olá! Vi o blog da Amélia Saúde e gostaria de mais informações.'
                            const encodedMessage = encodeURIComponent(message)
                            window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
                        }}
                    >
                        Falar no WhatsApp
                    </Button>
                </div>
            </div>
        </aside>
    )
}
