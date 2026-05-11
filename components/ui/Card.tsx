'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

type CardVariant = 'default' | 'glass' | 'elevated' | 'gold' | 'glass-premium' | 'white-glass' | 'gold-glass'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Visual style variant */
  variant?: CardVariant
  /** Card content */
  children: React.ReactNode
  /** Disable hover animations */
  noHover?: boolean
}

/**
 * Premium Card Component - Amélia Saúde Design System
 *
 * Variants:
 * - default: Subtle dark background with border
 * - glass: Glassmorphism with backdrop blur
 * - elevated: Hover animation with elevation and gold border
 * - gold: Premium gold accent border
 *
 * @example
 * <Card variant="elevated">
 *   <CardHeader>
 *     <h3>Titulo do Card</h3>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Conteudo do card...</p>
 *   </CardContent>
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, noHover = false, ...props }, ref) => {
    const baseClasses = cn(
      'rounded-card overflow-hidden',
      'transition-all duration-400 ease-premium'
    )

    const variantClasses: Record<CardVariant, string> = {
      default: 'bg-black-deep border border-gray-border',
      glass: cn(
        'bg-black-charcoal/60 backdrop-blur-xl',
        'border border-white/8',
        'shadow-premium'
      ),
      elevated: cn(
        'bg-black-deep border border-gray-border',
        !noHover && [
          'hover:-translate-y-1.5',
          'hover:shadow-premium-hover',
          'hover:border-gold-primary/40',
          'hover:shadow-[0_0_40px_rgba(212,168,75,0.08)]'
        ].join(' ')
      ),
      gold: cn(
        'bg-black-deep',
        'border border-gold-primary/25',
        'shadow-gold-sm',
        !noHover && 'hover:border-gold-signature/50 hover:shadow-gold-md'
      ),
      'glass-premium': cn(
        'bg-gradient-to-br from-gray-dark/90 to-black-charcoal/80',
        'border-2 border-gold-primary/30',
        'shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_50px_rgba(212,168,75,0.06)]',
        !noHover && [
          'hover:border-gold-signature/55',
          'hover:shadow-[0_12px_50px_rgba(0,0,0,0.5),0_0_70px_rgba(212,168,75,0.1)]',
          'hover:scale-[1.015]'
        ].join(' ')
      ),
      'white-glass': cn(
        // Fundo branco puro com gradiente sutil
        'bg-gradient-to-br from-white to-[#FAFAFA]',
        // Borda premium dourada sutil
        'border border-gold-primary/15',
        // Sombra elegante mais difusa
        'shadow-[0_12px_50px_rgba(0,0,0,0.12),0_6px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]',
        // Hover premium mais sutil
        !noHover && [
          'hover:border-gold-primary/35',
          'hover:shadow-[0_25px_70px_rgba(0,0,0,0.15),0_10px_30px_rgba(0,0,0,0.1),0_0_35px_rgba(212,168,75,0.08)]',
          'hover:scale-[1.015]',
          'hover:-translate-y-1'
        ].join(' ')
      ),
      'gold-glass': cn(
        // Fundo amarelo da paleta (forçado com hex)
        'bg-gold-primary',
        // Texto preto forçado
        'text-black',
        // Borda sutil
        'border border-black/20',
        // Hover
        !noHover && [
          'hover:-translate-y-0.5',
          'hover:shadow-gold-md'
        ].join(' '),
        'transition-all duration-300'
      ),
    }

    return (
      <motion.div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

Card.displayName = 'Card'

/**
 * Card Header Component
 * Top section of the card, typically for titles
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove bottom padding */
  noPadding?: boolean
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, noPadding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        noPadding ? '' : 'p-6 md:p-8',
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

/**
 * Card Content Component
 * Main content area of the card
 */
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove padding */
  noPadding?: boolean
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, noPadding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        noPadding ? '' : 'px-6 md:px-8 pb-6 md:pb-8',
        className
      )}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

/**
 * Card Footer Component
 * Bottom section with border separator
 */
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hide top border */
  noBorder?: boolean
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, noBorder, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        !noBorder && 'border-t border-white/5',
        'px-6 md:px-8 py-4 md:py-6',
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

/**
 * Card Image Component
 * Full-width image at top of card
 */
interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Aspect ratio class */
  aspectRatio?: 'video' | 'square' | 'auto'
}

export const CardImage = React.forwardRef<HTMLDivElement, CardImageProps>(
  ({ className, aspectRatio = 'video', src, alt, ...props }, ref) => {
    const aspectClasses = {
      video: 'aspect-video',
      square: 'aspect-square',
      auto: '',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-black-charcoal',
          aspectClasses[aspectRatio],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ''}
          className="w-full h-full object-cover"
          {...props}
        />
      </div>
    )
  }
)
CardImage.displayName = 'CardImage'
