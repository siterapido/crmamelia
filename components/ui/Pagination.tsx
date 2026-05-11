'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Pagination Component - Amélia Saúde Design System
 * Premium styled pagination with gold accents
 */
export const Pagination = ({ currentPage, totalPages, onPageChange, className }: PaginationProps) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      pages.push(totalPages)
    }

    return pages
  }

  const buttonBaseClasses = cn(
    'flex items-center justify-center',
    'min-w-[44px] h-11 px-3',
    'rounded-premium border',
    'transition-all duration-300',
    'font-medium text-sm'
  )

  const pageButtonClasses = (isActive: boolean) =>
    cn(
      buttonBaseClasses,
      isActive
        ? 'bg-gold-signature text-black-premium border-gold-signature shadow-gold-sm'
        : 'bg-white/5 border-white/10 text-white hover:border-gold-signature/50 hover:bg-white/10'
    )

  const navButtonClasses = (disabled: boolean) =>
    cn(
      buttonBaseClasses,
      'gap-1',
      disabled
        ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10 text-white/50'
        : 'bg-white/5 border-white/10 text-white hover:border-gold-signature/50 hover:bg-white/10'
    )

  return (
    <nav
      className={cn('flex items-center justify-center gap-2', className)}
      aria-label="Navegação de páginas"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navButtonClasses(currentPage === 1)}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-platinum/60">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={pageButtonClasses(currentPage === page)}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={navButtonClasses(currentPage === totalPages)}
        aria-label="Próxima página"
      >
        <span className="hidden sm:inline">Próxima</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
