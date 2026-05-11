'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghost-gold' | 'black'
type ButtonSize = 'sm' | 'base' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant
  /** Size preset */
  size?: ButtonSize
  /** Shows loading spinner and disables button */
  isLoading?: boolean
  /** Icon element to display before text */
  icon?: React.ReactNode
  /** Icon element to display after text */
  iconRight?: React.ReactNode
  /** Full width button */
  fullWidth?: boolean
}

/**
 * Premium Button Component - Amélia Saúde Design System
 *
 * Variants:
 * - primary: Gold gradient with shadow, elevated hover effect
 * - secondary: Gold outline with subtle hover background
 * - ghost: Glassmorphism with backdrop blur
 *
 * @example
 * <Button variant="primary" size="lg">Quero Contratar</Button>
 * <Button variant="secondary" icon={<Phone />}>Ligar Agora</Button>
 * <Button variant="ghost" isLoading>Processando...</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'base',
      isLoading = false,
      icon,
      iconRight,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses = cn(
      'relative font-semibold uppercase tracking-wide',
      'inline-flex items-center justify-center gap-2.5',
      'transition-all duration-300 ease-premium',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-signature focus-visible:ring-offset-2 focus-visible:ring-offset-black-premium',
      fullWidth && 'w-full'
    )

    const variantClasses = {
      primary: cn(
        'bg-gradient-gold text-black-premium font-bold',
        'shadow-gold-sm hover:shadow-gold-glow',
        'hover:-translate-y-0.5 hover:scale-[1.015]',
        'active:translate-y-0 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-gold-sm'
      ),
      secondary: cn(
        'border-2 border-white/25 text-white bg-transparent',
        'hover:border-gold-primary hover:text-gold-signature',
        'hover:shadow-[0_0_25px_rgba(212,168,75,0.12)]',
        'active:bg-gold-primary/10',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-white/25 disabled:hover:text-white'
      ),
      ghost: cn(
        'bg-white/5 border border-white/8 text-white',
        'backdrop-blur-xl',
        'hover:bg-white/10 hover:border-gold-primary/25 hover:text-gold-signature',
        'active:bg-white/15',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/8'
      ),
      'ghost-gold': cn(
        'bg-transparent border border-gold-primary/25',
        'text-gold-primary',
        'hover:bg-gold-primary/8 hover:border-gold-primary/45',
        'active:bg-gold-primary/12',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ),
      black: cn(
        'bg-black text-white border border-white/10',
        'shadow-[0_10px_30px_rgba(0,0,0,0.5)]',
        'hover:bg-zinc-900 hover:border-gold-primary/30 hover:text-gold-primary',
        'hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]',
        'active:scale-[0.98] transition-all duration-300'
      ),
    }

    const sizeClasses = {
      sm: 'px-5 py-2.5 text-sm rounded-[10px] min-h-[40px]',
      base: 'px-8 py-4 text-btn rounded-premium min-h-[52px]',
      lg: 'px-10 py-5 text-base rounded-premium min-h-[60px]',
    }

    const LoadingSpinner = () => (
      <motion.svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <circle
          className={variant === 'primary' ? 'stroke-black-premium/30' : 'stroke-current opacity-30'}
          cx="12"
          cy="12"
          r="10"
          strokeWidth="3"
        />
        <path
          className={variant === 'primary' ? 'stroke-black-premium' : 'stroke-current'}
          d="M12 2a10 10 0 0 1 10 10"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>
    )

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="opacity-70">{children}</span>
          </>
        ) : (
          <>
            {icon && (
              <span className="flex items-center justify-center flex-shrink-0">
                {icon}
              </span>
            )}
            {children}
            {iconRight && (
              <span className="flex items-center justify-center flex-shrink-0">
                {iconRight}
              </span>
            )}
          </>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
