'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { MagneticButton } from '@/components/animations'
import { useReducedMotion } from '@/components/hooks'

/**
 * Hero Section Gold Variant
 * Full gold/yellow background, no family photo
 * Dark text for contrast on gold background
 */
export const HeroSectionGold = () => {
  const prefersReducedMotion = useReducedMotion()
  const { scrollY } = useScroll()

  const scrollIndicatorOpacity = useTransform(scrollY, [0, 100], [1, 0])
  const contentY = useTransform(scrollY, [0, 300], [0, 50])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gold-primary">
      {/* Tech-inspired background texture */}
      <div className="absolute inset-0 z-0">
        {/* Circuit board grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(10,10,10,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(10,10,10,1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Diagonal circuit traces */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(10,10,10,1) 1px, transparent 1px),
              linear-gradient(-45deg, rgba(10,10,10,1) 1px, transparent 1px)
            `,
            backgroundSize: '120px 120px',
          }}
        />

        {/* Data node dots at grid intersections */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(10,10,10,1) 2px, transparent 2px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Larger connection nodes */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(10,10,10,1) 4px, transparent 4px)`,
            backgroundSize: '180px 180px',
            backgroundPosition: '30px 30px',
          }}
        />

        {/* Tech glow accent — top right */}
        <div
          className="absolute -top-20 -right-20 w-[700px] h-[700px] opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 60%)',
            filter: 'blur(100px)',
          }}
        />

        {/* Tech glow accent — bottom left */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] opacity-15 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(10,10,10,0.2) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Animated scan line effect (CSS only) */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 4px,
              rgba(10,10,10,0.5) 4px,
              rgba(10,10,10,0.5) 5px
            )`,
          }}
        />

        {/* Circuit path SVG overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.05]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="circuit-paths" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
              {/* Horizontal traces */}
              <line x1="0" y1="60" x2="100" y2="60" stroke="#0A0A0A" strokeWidth="1.5" />
              <line x1="140" y1="60" x2="240" y2="60" stroke="#0A0A0A" strokeWidth="1.5" />
              <line x1="0" y1="180" x2="80" y2="180" stroke="#0A0A0A" strokeWidth="1.5" />
              <line x1="160" y1="180" x2="240" y2="180" stroke="#0A0A0A" strokeWidth="1.5" />

              {/* Vertical traces */}
              <line x1="120" y1="0" x2="120" y2="40" stroke="#0A0A0A" strokeWidth="1.5" />
              <line x1="120" y1="80" x2="120" y2="160" stroke="#0A0A0A" strokeWidth="1.5" />
              <line x1="120" y1="200" x2="120" y2="240" stroke="#0A0A0A" strokeWidth="1.5" />

              {/* Right-angle connectors */}
              <polyline points="100,60 120,60 120,80" fill="none" stroke="#0A0A0A" strokeWidth="1.5" />
              <polyline points="120,160 120,180 160,180" fill="none" stroke="#0A0A0A" strokeWidth="1.5" />
              <polyline points="80,180 120,180 120,200" fill="none" stroke="#0A0A0A" strokeWidth="1.5" />

              {/* IC chip pads */}
              <rect x="110" y="50" width="20" height="20" rx="3" fill="none" stroke="#0A0A0A" strokeWidth="1" />
              <rect x="110" y="170" width="20" height="20" rx="3" fill="none" stroke="#0A0A0A" strokeWidth="1" />

              {/* Connection nodes */}
              <circle cx="100" cy="60" r="3" fill="#0A0A0A" />
              <circle cx="140" cy="60" r="3" fill="#0A0A0A" />
              <circle cx="80" cy="180" r="3" fill="#0A0A0A" />
              <circle cx="160" cy="180" r="3" fill="#0A0A0A" />
              <circle cx="120" cy="40" r="2.5" fill="#0A0A0A" />
              <circle cx="120" cy="200" r="2.5" fill="#0A0A0A" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-paths)" />
        </svg>

        {/* Bottom gradient for scroll transition */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      <Container className="relative z-10 flex flex-col justify-center min-h-screen pt-24 pb-20">
        <motion.div
          className="max-w-[700px]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y: prefersReducedMotion ? 0 : contentY }}
        >
          {/* Headline */}
          <motion.div variants={itemVariants} className="mb-6 lg:mb-8">
            <h1 className="font-display font-bold text-black-premium leading-[0.95] tracking-tight">
              <span className="block text-[clamp(2.5rem,7vw,5.5rem)]">
                Sua saúde
              </span>
              <span className="block text-[clamp(2.5rem,7vw,5.5rem)]">
                em nossos planos
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div variants={itemVariants} className="mb-10 lg:mb-12 max-w-[520px]">
            <p className="text-lg md:text-xl text-black-premium/70 leading-relaxed">
              Planos de saúde para você, sua família e sua empresa, com um time sempre pronto para lhe atender com agilidade, transparência e segurança.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <MagneticButton strength={0.1}>
              <Button
                variant="ghost"
                size="lg"
                className="!bg-black-premium !border !border-black-premium !text-white hover:!bg-black-premium/90 !px-8 !py-6 !text-base font-medium min-w-[200px] rounded-xl transition-all duration-300"
                onClick={() => {
                  document.getElementById('client-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Já Sou Cliente
              </Button>
            </MagneticButton>

            <MagneticButton strength={0.1}>
              <Button
                variant="ghost"
                size="lg"
                className="!bg-white !text-[#0A0A0A] hover:!bg-gray-100 !px-8 !py-6 !text-base font-bold min-w-[200px] rounded-xl !shadow-lg transition-all duration-300 hover:!shadow-xl !border !border-white/80"
                onClick={() => {
                  const phoneNumber = '5521972338589'
                  const message = 'Olá! Gostaria de fazer um orçamento de plano de saúde com a Amélia Saúde.'
                  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
                }}
              >
                Fazer Orçamento
              </Button>
            </MagneticButton>
          </motion.div>

          {/* Trust indicator */}
          <motion.div
            variants={itemVariants}
            className="mt-12 lg:mt-16 flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {[
                { src: '/avatars/avatar-1.jpg', alt: 'Cliente satisfeita' },
                { src: '/avatars/avatar-2.jpg', alt: 'Cliente satisfeita' },
                { src: '/avatars/avatar-3.jpg', alt: 'Cliente satisfeito' },
                { src: '/avatars/avatar-4.jpg', alt: 'Cliente satisfeita' },
              ].map((person, i) => (
                <img
                  key={i}
                  src={person.src}
                  alt={person.alt}
                  className="w-8 h-8 rounded-full border-2 border-gold-primary object-cover"
                />
              ))}
            </div>
            <div className="text-sm text-black-premium/70">
              <span className="text-black-premium font-medium">+2.500</span> famílias protegidas
            </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        style={{ opacity: prefersReducedMotion ? 0.6 : scrollIndicatorOpacity }}
        animate={!prefersReducedMotion ? { y: [0, 8, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
      >
        <button
          onClick={() => document.getElementById('client-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="p-3 rounded-full border border-black-premium/20 text-black-premium/50 hover:text-black-premium hover:border-black-premium/40 transition-colors"
          aria-label="Rolar para baixo"
        >
          <ChevronDown size={20} />
        </button>
      </motion.div>
    </section>
  )
}
