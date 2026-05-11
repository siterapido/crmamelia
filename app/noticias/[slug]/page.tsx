import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { ShareButton } from '@/components/ui/ShareButton'
import { NewsCard } from '@/components/ui/NewsCard'
import { NewsSidebar } from '@/components/sections/NewsSidebar'
import {
  getNewsBySlug,
  getRelatedNews,
  getPopularNews,
  getCategories,
  getAllSlugs,
} from '@/lib/api/news'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getNewsBySlug(slug)

  if (!article) {
    return {
      title: 'Notícia não encontrada | Amélia Saúde',
    }
  }

  return {
    title: `${article.title} | Amélia Saúde`,
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

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getNewsBySlug(slug)

  if (!article) {
    notFound()
  }

  const [relatedNews, popularNews, categories] = await Promise.all([
    getRelatedNews(article.category.slug, article.slug, 3),
    getPopularNews(5),
    getCategories(),
  ])

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-black-premium">
      {/* Hero Image */}
      <section className="relative h-[50vh] md:h-[60vh] pt-24 overflow-hidden">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black-premium via-black-premium/50 to-transparent" />

        {/* Back Button */}
        <Container className="relative h-full">
          <div className="absolute top-4">
            <Link
              href="/noticias"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide rounded-[10px] min-h-[40px] bg-white/5 border border-white/8 text-white backdrop-blur-xl hover:bg-white/10 hover:border-gold-primary/25 hover:text-gold-signature transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </div>
        </Container>
      </section>

      {/* Article Header */}
      <section className="relative -mt-32 pb-8">
        <Container>
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <CategoryBadge category={article.category} />
              {article.featured && (
                <span className="px-3 py-1 rounded-full bg-gold-signature/20 text-gold-signature text-xs font-semibold uppercase tracking-wider">
                  Destaque
                </span>
              )}
            </div>

            <h1 className="font-display text-h3 md:text-h2 text-white font-bold mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-platinum/70">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readingTime} min de leitura
              </span>
              <ShareButton title={article.title} text={article.excerpt} />
            </div>

            {/* Author */}
            {article.author && (
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
                {article.author.avatar && (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-white font-semibold">{article.author.name}</p>
                  {article.author.role && (
                    <p className="text-platinum/60 text-sm">{article.author.role}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Article Content */}
      <section className="py-8 md:py-12 bg-black-deep">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Article Body */}
            <article className="lg:col-span-2">
              <div
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:font-display prose-headings:text-white prose-headings:font-semibold
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-platinum/80 prose-p:leading-relaxed
                  prose-a:text-gold-signature prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-strong:font-semibold
                  prose-ul:text-platinum/80 prose-ol:text-platinum/80
                  prose-li:marker:text-gold-signature
                  prose-blockquote:border-gold-signature/50 prose-blockquote:text-platinum/70
                  prose-code:text-gold-light prose-code:bg-black-charcoal prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-black-charcoal prose-pre:border prose-pre:border-gray-border"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/noticias?busca=${encodeURIComponent(tag)}`}
                        className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 text-platinum/80 hover:bg-gold-signature/10 hover:border-gold-signature/30 hover:text-gold-light transition-all duration-300"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <NewsSidebar
                popularNews={popularNews}
                categories={categories}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-12 md:py-16 bg-black-premium">
          <Container>
            <h2 className="font-display text-h4 md:text-h3 text-white font-bold mb-8">
              Notícias Relacionadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNews.map((news) => (
                <NewsCard key={news.id} article={news} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  )
}
