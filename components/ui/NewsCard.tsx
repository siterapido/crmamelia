'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import type { NewsArticle } from '@/lib/types/news'

type NewsCardVariant = 'default' | 'featured' | 'horizontal'

interface NewsCardProps {
  article: NewsArticle
  variant?: NewsCardVariant
  className?: string
  priority?: boolean
}

/**
 * News Card Component - Amélia Saúde News Portal
 * Multiple variants for different layouts
 */
export const NewsCard = ({ article, variant = 'default', className, priority = false }: NewsCardProps) => {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  if (variant === 'featured') {
    return (
      <Link href={`/noticias/${article.slug}`} className={cn('group block', className)}>
        <motion.article
          className={cn(
            'relative overflow-hidden rounded-card',
            'bg-black-deep border border-gray-border',
            'transition-all duration-500',
            'hover:border-gold-signature/50 hover:shadow-[0_0_40px_rgba(245,166,35,0.1)]'
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[400px] overflow-hidden">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                priority={priority}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black-premium/60 via-transparent to-transparent lg:bg-gradient-to-r" />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-gold-signature/20 text-gold-signature text-xs font-semibold uppercase tracking-wider">
                  Destaque
                </span>
                <CategoryBadge category={article.category} size="sm" />
              </div>

              <h2 className="font-display text-h4 md:text-h3 text-white font-bold mb-4 line-clamp-3 group-hover:text-gold-light transition-colors duration-300">
                {article.title}
              </h2>

              <p className="text-platinum/80 text-body mb-6 line-clamp-3">
                {article.excerpt}
              </p>

              <div className="flex items-center gap-4 text-sm text-platinum/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {article.readingTime} min de leitura
                </span>
              </div>

              {article.author && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                  {article.author.avatar && (
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-white font-medium text-sm">{article.author.name}</p>
                    {article.author.role && (
                      <p className="text-platinum/60 text-xs">{article.author.role}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.article>
      </Link>
    )
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/noticias/${article.slug}`} className={cn('group block', className)}>
        <article className="flex gap-4">
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-premium">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-gold-light transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-platinum/60">
              <span>{formattedDate}</span>
              <span>·</span>
              <span>{article.readingTime} min</span>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/noticias/${article.slug}`} className={cn('group block h-full', className)}>
      <motion.article
        className={cn(
          'h-full flex flex-col overflow-hidden rounded-card',
          'bg-black-deep border border-gray-border',
          'transition-all duration-400',
          'hover:-translate-y-2 hover:border-gold-primary/50',
          'hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_0_30px_rgba(245,166,35,0.1)]'
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4">
            <CategoryBadge category={article.category} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6 flex flex-col">
          <h3 className="font-display text-lg md:text-xl text-white font-semibold mb-3 line-clamp-2 group-hover:text-gold-light transition-colors duration-300">
            {article.title}
          </h3>

          <p className="text-platinum/70 text-sm mb-4 line-clamp-2 flex-1">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-platinum/60 pt-4 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime} min
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

/**
 * News Card Skeleton for loading states
 */
export const NewsCardSkeleton = ({ variant = 'default' }: { variant?: NewsCardVariant }) => {
  if (variant === 'featured') {
    return (
      <div className="rounded-card bg-black-deep border border-gray-border overflow-hidden animate-pulse">
        <div className="grid lg:grid-cols-2">
          <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[400px] bg-black-charcoal" />
          <div className="p-8 lg:p-10">
            <div className="flex gap-3 mb-4">
              <div className="h-6 w-20 rounded-full bg-black-charcoal" />
              <div className="h-6 w-16 rounded-full bg-black-charcoal" />
            </div>
            <div className="h-8 w-3/4 rounded bg-black-charcoal mb-3" />
            <div className="h-8 w-1/2 rounded bg-black-charcoal mb-4" />
            <div className="h-4 w-full rounded bg-black-charcoal mb-2" />
            <div className="h-4 w-2/3 rounded bg-black-charcoal" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 animate-pulse">
        <div className="w-24 h-24 rounded-premium bg-black-charcoal flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 w-full rounded bg-black-charcoal mb-2" />
          <div className="h-4 w-2/3 rounded bg-black-charcoal mb-3" />
          <div className="h-3 w-1/3 rounded bg-black-charcoal" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-card bg-black-deep border border-gray-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-black-charcoal" />
      <div className="p-6">
        <div className="h-5 w-3/4 rounded bg-black-charcoal mb-2" />
        <div className="h-5 w-1/2 rounded bg-black-charcoal mb-4" />
        <div className="h-4 w-full rounded bg-black-charcoal mb-2" />
        <div className="h-4 w-2/3 rounded bg-black-charcoal mb-4" />
        <div className="flex justify-between pt-4 border-t border-white/5">
          <div className="h-3 w-20 rounded bg-black-charcoal" />
          <div className="h-3 w-16 rounded bg-black-charcoal" />
        </div>
      </div>
    </div>
  )
}
