import React from 'react'
import { cn } from '@/lib/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'success' | 'gold'
  icon?: React.ReactNode
  glow?: boolean
}

/**
 * Premium Badge Component
 * Used for labels, tags, and credibility indicators
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'premium', icon, glow = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300'

    const variantClasses = {
      default: 'bg-white/8 border border-white/15 text-white hover:border-white/25',
      premium: 'bg-gold-primary/12 border border-gold-primary/30 text-gold-primary shadow-[0_0_20px_rgba(107,91,161,0.08)]',
      success: 'bg-success-premium/18 border border-success-premium text-success-premium',
      gold: 'bg-gradient-to-r from-gold-primary/15 to-gold-signature/15 border border-gold-primary/40 text-gold-signature shadow-[0_0_25px_rgba(107,91,161,0.1)]',
    }

    const glowClasses = glow ? 'animate-glow-pulse' : ''

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], glowClasses, className)}
        {...props}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </div>
    )
  },
)

Badge.displayName = 'Badge'
