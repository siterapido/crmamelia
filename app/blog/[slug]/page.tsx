import React from 'react'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { BlogArticle } from '@/components/blog'
import { getNewsBySlug, getRelatedNews, getAllSlugs } from '@/lib/api/news'

interface BlogArticlePageProps {
    params: {
        slug: string
    }
}

/**
 * Blog Article Page - Dynamic Route
 * Displays individual blog article
 */
export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
    const { slug } = params

    // Fetch article
    const article = await getNewsBySlug(slug)

    if (!article) {
        notFound()
    }

    // Fetch related articles
    const relatedArticles = await getRelatedNews(article.category.slug, slug, 3)

    return (
        <main className="min-h-screen bg-black-premium">
            {/* Article Hero */}
            <section className="relative pt-28 md:pt-32 pb-12 bg-gradient-black-deep">
                <Container>
                    <BlogArticle article={article} relatedArticles={relatedArticles} />
                </Container>
            </section>

            {/* Bottom Spacing */}
            <div className="h-24 bg-black-deep" />
        </main>
    )
}

/**
 * Generate static params for all article slugs
 * Enables static generation at build time
 */
export async function generateStaticParams() {
    const slugs = await getAllSlugs()

    return slugs.map((slug) => ({
        slug,
    }))
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: BlogArticlePageProps) {
    const { slug } = params
    const article = await getNewsBySlug(slug)

    if (!article) {
        return {
            title: 'Artigo não encontrado - Amélia Saúde',
        }
    }

    return {
        title: `${article.title} - Blog Amélia Saúde`,
        description: article.excerpt,
        openGraph: {
            title: article.title,
            description: article.excerpt,
            images: [article.coverImage],
            type: 'article',
            publishedTime: article.publishedAt,
            authors: [article.author.name],
        },
    }
}
