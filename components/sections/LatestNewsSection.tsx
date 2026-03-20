'use server'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { NewsCard } from '@/components/ui/NewsCard'
import { getNews } from '@/lib/api/news'
import { Button } from '@/components/ui/Button'

/**
 * Latest News Section
 * Displays the 3 most recent articles on the home page
 */
export const LatestNewsSection = async () => {
    // Fetch latest 3 articles
    const { data: articles } = await getNews({ limit: 3 })

    if (!articles || articles.length === 0) return null

    return (
        <section className="py-24 bg-black-premium relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <Container>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-gold-primary text-sm font-bold uppercase tracking-[0.3em] mb-4 block">
                            Conteúdo & Saúde
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight">
                            Tudo sobre <span className="text-gold-primary/60">saúde e bem estar</span>
                        </h2>
                    </div>

                    <Link href="/noticias">
                        <Button variant="ghost" className="group text-gold-primary hover:text-gold-light p-0 h-auto font-bold text-lg">
                            Ver todas as notícias
                            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>
            </Container>
        </section>
    )
}
