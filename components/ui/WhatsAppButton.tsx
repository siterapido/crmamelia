'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface WhatsAppButtonProps {
  /** WhatsApp phone number with country code (e.g., 5511999999999) */
  phoneNumber?: string
  /** Pre-filled message */
  message?: string
}

/**
 * WhatsApp Floating Button - Amélia Saúde Design System
 *
 * Premium floating action button with:
 * - Subtle pulse animation every 3 seconds
 * - Spring entrance animation
 * - Hover and tap interactions
 * - Always visible (fixed position)
 *
 * @example
 * <WhatsAppButton phoneNumber="5511999999999" message="Olá!" />
 */
export const WhatsAppButton = ({
  phoneNumber = '5521972229609',
  message = 'Olá! Vim pelo site da Amélia Saúde e gostaria de mais informações.',
}: WhatsAppButtonProps) => {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-40 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 1,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Contato via WhatsApp"
      title="Fale conosco pelo WhatsApp"
    >
      {/* Pulse ring effect */}
      <motion.span
        className="absolute inset-0 rounded-full bg-[#25D366]"
        animate={{
          scale: [1, 1.4, 1.4],
          opacity: [0.4, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeOut',
        }}
      />

      {/* Secondary pulse */}
      <motion.span
        className="absolute inset-0 rounded-full bg-[#25D366]"
        animate={{
          scale: [1, 1.2, 1.2],
          opacity: [0.3, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeOut',
          delay: 0.3,
        }}
      />

      {/* Main button */}
      <span
        className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
        style={{
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
        }}
      >
        <MessageCircle size={28} strokeWidth={2} />
      </span>
    </motion.button>
  )
}
