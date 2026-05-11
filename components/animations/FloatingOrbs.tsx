'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/components/hooks'

interface OrbConfig {
  size: number
  x: string
  y: string
  delay: number
  duration: number
}

interface FloatingOrbsProps {
  count?: number
  className?: string
}

/**
 * FloatingOrbs - Decorative floating orbs for immersive backgrounds
 * Creates ambient movement with gold-tinted blurred circles
 */
export function FloatingOrbs({ count = 3, className = '' }: FloatingOrbsProps) {
  const prefersReducedMotion = useReducedMotion()

  // Predefined orb configurations for consistent placement
  const orbConfigs: OrbConfig[] = [
    { size: 300, x: '10%', y: '20%', delay: 0, duration: 20 },
    { size: 200, x: '70%', y: '60%', delay: 2, duration: 25 },
    { size: 250, x: '80%', y: '10%', delay: 4, duration: 22 },
    { size: 180, x: '20%', y: '70%', delay: 1, duration: 28 },
    { size: 220, x: '50%', y: '40%', delay: 3, duration: 24 },
  ].slice(0, count)

  if (prefersReducedMotion) {
    return null
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbConfigs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: 'radial-gradient(circle, rgba(123,107,177,0.15) 0%, rgba(123,107,177,0.05) 50%, transparent 70%)',
            filter: 'blur(60px)',
            willChange: 'transform',
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -40, 20, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
