/**
 * Posts API Route
 * GET /api/posts - List posts
 * POST /api/posts - Create post (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, categories, authors, postTags } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { canAccess } from '@/lib/auth/rbac'
import { eq, desc, ilike, or, and, sql } from 'drizzle-orm'
import { z } from 'zod'

const createPostSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    slug: z.string().min(1, 'Slug é obrigatório'),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    coverImage: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    authorId: z.string().uuid().optional(),
    featured: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    aiGenerated: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const status = searchParams.get('status')
        const featured = searchParams.get('featured')

        const offset = (page - 1) * limit

        // Build conditions
        const conditions = []

        if (category && category !== 'all') {
            const [cat] = await db
                .select({ id: categories.id })
                .from(categories)
                .where(eq(categories.slug, category))
                .limit(1)
            if (cat) {
                conditions.push(eq(posts.categoryId, cat.id))
            }
        }

        if (search) {
            conditions.push(
                or(
                    ilike(posts.title, `%${search}%`),
                    ilike(posts.excerpt, `%${search}%`)
                )
            )
        }

        if (status) {
            conditions.push(eq(posts.status, status))
        }

        if (featured === 'true') {
            conditions.push(eq(posts.featured, true))
        }

        // Get posts with relations
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const [postsData, countResult] = await Promise.all([
            db
                .select({
                    id: posts.id,
                    slug: posts.slug,
                    title: posts.title,
                    excerpt: posts.excerpt,
                    content: posts.content,
                    coverImage: posts.coverImage,
                    publishedAt: posts.publishedAt,
                    readingTime: posts.readingTime,
                    featured: posts.featured,
                    status: posts.status,
                    aiGenerated: posts.aiGenerated,
                    createdAt: posts.createdAt,
                    updatedAt: posts.updatedAt,
                    category: {
                        id: categories.id,
                        name: categories.name,
                        slug: categories.slug,
                        color: categories.color,
                    },
                    author: {
                        id: authors.id,
                        name: authors.name,
                        role: authors.role,
                        avatarUrl: authors.avatarUrl,
                    },
                })
                .from(posts)
                .leftJoin(categories, eq(posts.categoryId, categories.id))
                .leftJoin(authors, eq(posts.authorId, authors.id))
                .where(whereClause)
                .orderBy(desc(posts.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: sql<number>`count(*)` })
                .from(posts)
                .where(whereClause),
        ])

        // Get tags for each post
        const postsWithTags = await Promise.all(
            postsData.map(async (post) => {
                const tags = await db
                    .select({ tag: postTags.tag })
                    .from(postTags)
                    .where(eq(postTags.postId, post.id))
                return {
                    ...post,
                    tags: tags.map((t) => t.tag),
                }
            })
        )

        const total = Number(countResult[0]?.count || 0)
        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({
            data: postsWithTags,
            total,
            page,
            totalPages,
            hasMore: page < totalPages,
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        return NextResponse.json(
            { error: 'Erro ao buscar posts' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check auth + role
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }
        if (!canAccess(user, 'blog')) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const body = await request.json()
        const result = createPostSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { tags: tagList, ...postData } = result.data

        // Check if slug exists
        const [existing] = await db
            .select({ id: posts.id })
            .from(posts)
            .where(eq(posts.slug, postData.slug))
            .limit(1)

        if (existing) {
            return NextResponse.json(
                { error: 'Slug já existe' },
                { status: 400 }
            )
        }

        // Create post
        const [newPost] = await db
            .insert(posts)
            .values({
                ...postData,
                publishedAt: postData.status === 'published' ? new Date() : null,
            })
            .returning()

        // Create tags
        if (tagList && tagList.length > 0) {
            await db.insert(postTags).values(
                tagList.map((tag) => ({
                    postId: newPost.id,
                    tag,
                }))
            )
        }

        return NextResponse.json({ success: true, post: newPost }, { status: 201 })
    } catch (error) {
        console.error('Error creating post:', error)
        return NextResponse.json(
            { error: 'Erro ao criar post' },
            { status: 500 }
        )
    }
}
