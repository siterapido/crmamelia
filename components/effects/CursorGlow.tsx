'use client'

import { useEffect, useState, useCallback } from 'react'

interface MousePosition {
  x: number
  y: number
}

/**
 * CursorGlow Component
 * Creates a premium neon gold glow effect that follows the cursor
 * Only active on desktop devices (pointer: fine)
 */
export function CursorGlow() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })

    // Check if hovering over dark/black elements
    const element = document.elementFromPoint(e.clientX, e.clientY)
    if (element) {
      const computedStyle = window.getComputedStyle(element)
      const bgColor = computedStyle.backgroundColor

      // Check if background is dark (black or near-black)
      const isDark = isDarkBackground(bgColor)
      setIsHovering(isDark)
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false)
  }, [])

  useEffect(() => {
    // Only enable on devices with fine pointer (desktop)
    const mediaQuery = window.matchMedia('(pointer: fine)')
    if (!mediaQuery.matches) return

    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseenter', handleMouseEnter)
    document.body.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseenter', handleMouseEnter)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave])

  // Don't render on mobile/touch devices
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(pointer: fine)')
    if (!mediaQuery.matches) return null
  }

  return (
    <>
      {/* Outer glow - larger, softer */}
      <div
        className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300"
        style={{
          opacity: isVisible && isHovering ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 166, 35, 0.02), transparent 40%)`,
        }}
        aria-hidden="true"
      />

      {/* Middle glow - medium intensity */}
      <div
        className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-200"
        style={{
          opacity: isVisible && isHovering ? 1 : 0,
          background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 184, 0, 0.03), transparent 40%)`,
        }}
        aria-hidden="true"
      />

      {/* Inner glow - intense, sharp */}
      <div
        className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-150"
        style={{
          opacity: isVisible && isHovering ? 1 : 0,
          background: `radial-gradient(150px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 184, 0, 0.04), transparent 40%)`,
        }}
        aria-hidden="true"
      />

      {/* Core spotlight - brightest center */}
      <div
        className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-100"
        style={{
          opacity: isVisible && isHovering ? 1 : 0,
          background: `radial-gradient(80px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 166, 35, 0.05), transparent 50%)`,
        }}
        aria-hidden="true"
      />
    </>
  )
}

/**
 * Utility function to check if a background color is dark
 */
function isDarkBackground(bgColor: string): boolean {
  // Handle transparent
  if (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
    return true // Assume dark for transparent (since body is black)
  }

  // Parse RGB values
  const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return true

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Consider dark if luminance is below 0.3 (30%)
  return luminance < 0.3
}

export default CursorGlow
