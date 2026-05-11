/**
 * News Portal Types - Amélia Saúde
 */

export interface NewsCategory {
  id: string
  name: string
  slug: string
  color?: string
}

export interface Author {
  name: string
  avatar?: string
  role?: string
}

export interface NewsArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  category: NewsCategory
  author: Author
  publishedAt: string
  readingTime: number
  featured: boolean
  tags: string[]
}

export interface NewsFilters {
  category?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}
