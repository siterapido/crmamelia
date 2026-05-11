/**
 * News API - Amélia Saúde
 * Fetches data from Neon Database using Drizzle ORM
 */
'use server'

import { db } from '@/lib/db'
import { posts, categories, authors, postTags } from '@/lib/db/schema'
import { eq, desc, and, or, ilike, like, count, sql, inArray } from 'drizzle-orm'
import type { NewsArticle, NewsCategory, NewsFilters, PaginatedResponse } from '@/lib/types/news'

// Helper to map DB result to NewsArticle
function mapPostToArticle(post: any): NewsArticle {
  return {
    id: post.posts.id,
    slug: post.posts.slug,
    title: post.posts.title,
    excerpt: post.posts.excerpt || '',
    content: post.posts.content || '',
    coverImage: post.posts.coverImage || '/images/blog/placeholder.jpg',
    category: {
      id: post.categories?.id || '',
      name: post.categories?.name || 'Geral',
      slug: post.categories?.slug || 'geral',
      color: post.categories?.color || '#10D86F',
    },
    author: {
      name: post.authors?.name || 'Equipe Amélia Saúde',
      role: post.authors?.role || 'Colaborador',
      avatar: post.authors?.avatarUrl || undefined,
    },
    publishedAt: post.posts.publishedAt ? new Date(post.posts.publishedAt).toISOString() : new Date().toISOString(),
    readingTime: post.posts.readingTime || 5,
    featured: post.posts.featured || false,
    tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
  }
}

/**
 * Base query builder to include relations
 */
function getBaseQuery() {
  return db
    .select({
      posts: posts,
      categories: categories,
      authors: authors,
      tags: sql<string>`string_agg(${postTags.tag}, ',')`,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .leftJoin(postTags, eq(posts.id, postTags.postId))
    .groupBy(posts.id, categories.id, authors.id)
}

/**
 * Get paginated news with filters
 */
export async function getNews(filters: NewsFilters = {}): Promise<PaginatedResponse<NewsArticle>> {
  const { category, search, page = 1, limit = 6 } = filters
  const offset = (page - 1) * limit

  let whereClause = eq(posts.status, 'published')

  // Filter by category
  if (category && category !== 'all') {
    const categoryResult = await db.query.categories.findFirst({
      where: eq(categories.slug, category),
      columns: { id: true }
    })

    if (categoryResult) {
      whereClause = and(whereClause, eq(posts.categoryId, categoryResult.id)) as any
    }
  }

  // Filter by search
  if (search) {
    const searchLower = `%${search.toLowerCase()}%`
    whereClause = and(
      whereClause,
      or(
        ilike(posts.title, searchLower),
        ilike(posts.excerpt, searchLower),
        ilike(posts.content, searchLower)
      )
    ) as any
  }

  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(posts)
    .where(whereClause)

  const total = totalResult[0]?.count || 0
  const totalPages = Math.ceil(total / limit)

  // Get data
  const results = await getBaseQuery()
    .where(whereClause)
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset)

  const data = results.map(mapPostToArticle)

  return {
    data,
    total,
    page,
    totalPages,
    hasMore: page < totalPages,
  }
}

/**
 * Get single news article by slug
 */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const results = await getBaseQuery()
    .where(eq(posts.slug, slug))
    .limit(1)

  if (results.length === 0) return null
  return mapPostToArticle(results[0])
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<NewsCategory[]> {
  const results = await db.select().from(categories) // Assuming authors, etc not needed here. 
  // Wait, the interface is NewsCategory { id, name, slug, color } which matches DB schema except 'createdAt'

  return results.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    color: cat.color || undefined
  }))
}

/**
 * Get featured news
 */
export async function getFeaturedNews(): Promise<NewsArticle | null> {
  const results = await getBaseQuery()
    .where(and(eq(posts.status, 'published'), eq(posts.featured, true)))
    .orderBy(desc(posts.publishedAt))
    .limit(1)

  if (results.length === 0) {
    // Fallback to latest post if no featured
    const latestInfo = await getBaseQuery()
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.publishedAt))
      .limit(1)

    if (latestInfo.length === 0) return null
    return mapPostToArticle(latestInfo[0])
  }

  return mapPostToArticle(results[0])
}

/**
 * Get popular/most read news
 */
export async function getPopularNews(limit = 5): Promise<NewsArticle[]> {
  // In a real app we'd sort by views. For now, just latest or featured.
  // Let's mix it up - random or just latest.
  const results = await getBaseQuery()
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)

  return results.map(mapPostToArticle)
}

/**
 * Get related news by category
 */
export async function getRelatedNews(categorySlug: string, excludeSlug: string, limit = 3): Promise<NewsArticle[]> {
  const categoryResult = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
    columns: { id: true }
  })

  if (!categoryResult) return []

  const results = await getBaseQuery()
    .where(
      and(
        eq(posts.status, 'published'),
        eq(posts.categoryId, categoryResult.id),
        sql`${posts.slug} != ${excludeSlug}`
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit)

  return results.map(mapPostToArticle)
}

/**
 * Get all article slugs (for static generation)
 */
export async function getAllSlugs(): Promise<string[]> {
  const results = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.status, 'published'))

  return results.map(r => r.slug)
}
