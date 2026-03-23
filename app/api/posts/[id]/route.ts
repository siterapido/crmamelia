/**
 * Single Post API Route
 * GET /api/posts/[id] - Get post by ID or slug
 * PUT /api/posts/[id] - Update post
 * DELETE /api/posts/[id] - Delete post
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, categories, authors, postTags } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { canAccess } from '@/lib/auth/rbac'
import { eq, or } from 'drizzle-orm'
import { z } from 'zod'

const updatePostSchema = z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    coverImage: z.string().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    authorId: z.string().uuid().nullable().optional(),
    featured: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    tags: z.array(z.string()).optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params

        // Find by ID or slug
        const [post] = await db
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
            .where(or(eq(posts.id, id), eq(posts.slug, id)))
            .limit(1)

        if (!post) {
            return NextResponse.json(
                { error: 'Post não encontrado' },
                { status: 404 }
            )
        }

        // Get tags
        const tags = await db
            .select({ tag: postTags.tag })
            .from(postTags)
            .where(eq(postTags.postId, post.id))

        return NextResponse.json({
            ...post,
            tags: tags.map((t) => t.tag),
        })
    } catch (error) {
        console.error('Error fetching post:', error)
        return NextResponse.json(
            { error: 'Erro ao buscar post' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }
        if (!canAccess(user, 'blog')) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const { id } = await context.params
        const body = await request.json()
        const result = updatePostSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { tags: tagList, ...updateData } = result.data

        // Check if post exists
        const [existing] = await db
            .select({ id: posts.id, status: posts.status })
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1)

        if (!existing) {
            return NextResponse.json(
                { error: 'Post não encontrado' },
                { status: 404 }
            )
        }

        // If changing slug, check uniqueness
        if (updateData.slug) {
            const [slugExists] = await db
                .select({ id: posts.id })
                .from(posts)
                .where(eq(posts.slug, updateData.slug))
                .limit(1)

            if (slugExists && slugExists.id !== id) {
                return NextResponse.json(
                    { error: 'Slug já existe' },
                    { status: 400 }
                )
            }
        }

        // Update publishedAt if status changes to published
        const updateValues: Record<string, unknown> = {
            ...updateData,
            updatedAt: new Date(),
        }

        if (updateData.status === 'published' && existing.status !== 'published') {
            updateValues.publishedAt = new Date()
        }

        // Update post
        const [updatedPost] = await db
            .update(posts)
            .set(updateValues)
            .where(eq(posts.id, id))
            .returning()

        // Update tags if provided
        if (tagList !== undefined) {
            await db.delete(postTags).where(eq(postTags.postId, id))
            if (tagList.length > 0) {
                await db.insert(postTags).values(
                    tagList.map((tag) => ({
                        postId: id,
                        tag,
                    }))
                )
            }
        }

        return NextResponse.json({ success: true, post: updatedPost })
    } catch (error) {
        console.error('Error updating post:', error)
        return NextResponse.json(
            { error: 'Erro ao atualizar post' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }
        if (!canAccess(user, 'blog')) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const { id } = await context.params

        // Check if post exists
        const [existing] = await db
            .select({ id: posts.id })
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1)

        if (!existing) {
            return NextResponse.json(
                { error: 'Post não encontrado' },
                { status: 404 }
            )
        }

        // Delete post (tags will cascade)
        await db.delete(posts).where(eq(posts.id, id))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting post:', error)
        return NextResponse.json(
            { error: 'Erro ao excluir post' },
            { status: 500 }
        )
    }
}
