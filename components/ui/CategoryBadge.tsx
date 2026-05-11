'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'
import type { NewsCategory } from '@/lib/types/news'

interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: NewsCategory
  size?: 'sm' | 'base'
  interactive?: boolean
}

/**
 * Category Badge Component - Amélia Saúde News Portal
 * Displays category with custom color indicator
 */
export const CategoryBadge = React.forwardRef<HTMLSpanElement, CategoryBadgeProps>(
  ({ category, size = 'base', interactive = false, className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      base: 'px-3 py-1.5 text-sm',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          'bg-white/5 border border-white/10',
          'transition-all duration-300',
          interactive && 'cursor-pointer hover:bg-white/10 hover:border-white/20',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color || '#FFB800' }}
        />
        <span className="text-white/90">{category.name}</span>
      </span>
    )
  }
)

CategoryBadge.displayName = 'CategoryBadge'
