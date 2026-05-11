'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { Container } from '@/components/ui/Container'

type SectionBackground = 'black' | 'charcoal' | 'gradient' | 'transparent' | 'warm' | 'radial-warm'
type SectionPadding = 'sm' | 'base' | 'lg' | 'xl'

interface SectionProps {
  /** Section content */
  children: React.ReactNode
  /** Background style variant */
  background?: SectionBackground
  /** Vertical padding size */
  padding?: SectionPadding
  /** Disable fade-in animation */
  noAnimation?: boolean
  /** Use full width (no Container) */
  fullWidth?: boolean
  /** Section HTML id for anchor links */
  id?: string
  /** Additional wrapper for content */
  innerClassName?: string
  /** Additional classes for the section */
  className?: string
  /** ARIA label for accessibility */
  'aria-label'?: string
  /** ARIA labelledby for accessibility */
  'aria-labelledby'?: string
}

/**
 * Section Wrapper Component - Amélia Saúde Design System
 *
 * Reusable section container with:
 * - Consistent padding across all sections
 * - Multiple background variants
 * - Fade-in animation on viewport entry
 * - Responsive design
 *
 * @example
 * <Section background="charcoal" padding="lg" id="about">
 *   <h2>Sobre Nos</h2>
 *   <p>Conteudo da secao...</p>
 * </Section>
 *
 * @example
 * <Section background="black" fullWidth noAnimation>
 *   <CustomHeroContent />
 * </Section>
 */
export const Section = ({
  children,
  className,
  innerClassName,
  background = 'black',
  padding = 'base',
  noAnimation = false,
  fullWidth = false,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: SectionProps) => {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px 0px',
  })

  const backgroundClasses: Record<SectionBackground, string> = {
    black: 'bg-black-premium',
    charcoal: 'bg-black-deep',
    gradient: 'bg-gradient-black-deep',
    transparent: 'bg-transparent',
    warm: 'bg-black-warm',
    'radial-warm': 'bg-radial-warm',
  }

  const paddingClasses: Record<SectionPadding, string> = {
    sm: 'py-12 md:py-16',
    base: 'py-16 md:py-24',
    lg: 'py-20 md:py-32',
    xl: 'py-24 md:py-40',
  }

  const content = fullWidth ? (
    <div className={innerClassName}>{children}</div>
  ) : (
    <Container className={innerClassName}>{children}</Container>
  )

  if (noAnimation) {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          backgroundClasses[background],
          paddingClasses[padding],
          'relative overflow-hidden',
          className
        )}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
      >
        {content}
      </section>
    )
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={cn(
        backgroundClasses[background],
        paddingClasses[padding],
        'relative overflow-hidden',
        className
      )}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {content}
    </motion.section>
  )
}

/**
 * Section Title Component
 * Consistent heading style for sections
 */
interface SectionTitleProps {
  /** Main title text */
  children: React.ReactNode
  /** Optional subtitle/eyebrow text */
  subtitle?: string
  /** Center align text */
  center?: boolean
  /** Additional classes */
  className?: string
}

export const SectionTitle = ({
  children,
  subtitle,
  center = false,
  className,
}: SectionTitleProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px 0px' })

  return (
    <motion.div
      ref={ref}
      className={cn(center && 'text-center', 'mb-12 md:mb-16', className)}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {subtitle && (
        <span className="inline-block text-gold-primary text-sm font-semibold uppercase tracking-widest mb-4">
          {subtitle}
        </span>
      )}
      <h2 className="font-display text-h3 md:text-h2 text-white font-semibold">
        {children}
      </h2>
    </motion.div>
  )
}

/**
 * Section Divider Component
 * Subtle gradient line separator
 */
export const SectionDivider = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'h-px w-full max-w-lg mx-auto',
      'bg-gradient-separator',
      className
    )}
  />
)
