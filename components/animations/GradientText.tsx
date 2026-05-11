'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/components/hooks'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  duration?: number
}

/**
 * GradientText - Animated gradient flowing through text
 * Creates a premium shimmer effect on important text
 */
export function GradientText({
  children,
  className = '',
  duration = 3,
}: GradientTextProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <span className={`text-gold-primary ${className}`}>
        {children}
      </span>
    )
  }

  return (
    <motion.span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, #5B4B91 0%, #7B6BB1 25%, #BBB1E1 50%, #7B6BB1 75%, #5B4B91 100%)',
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  )
}
