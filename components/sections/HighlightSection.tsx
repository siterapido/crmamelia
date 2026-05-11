'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Shield, Clock, Heart, Phone, Check, Stethoscope, HeartPulse, Activity } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SplitText, TiltCard, MagneticButton, ParallaxLayer, FloatingOrbs } from '@/components/animations'

interface HighlightItem {
  icon: React.ElementType
  title: string
  description: string
}

interface HighlightSectionProps {
  variant?: 'default' | 'medical' | 'care'
  badge?: string
  heading: string
  subheading?: string
  items: HighlightItem[]
  ctaText?: string
  ctaAction?: () => void
}

/**
 * Highlight Section Component
 * Gold background section with healthcare-themed textures
 * For displaying key benefits, differentiators, or features
 */
export const HighlightSection: React.FC<HighlightSectionProps> = ({
  variant = 'default',
  badge,
  heading,
  subheading,
  items,
  ctaText,
  ctaAction,
}) => {
  const patternStyles = {
    default: 'pattern-shield',
    medical: 'pattern-medical-cross',
    care: 'pattern-care',
  }

  return (
    <section
      className={cn(
        'relative py-24 md:py-32 section-gold grain-gold glow-corner-dark overflow-hidden',
        patternStyles[variant]
      )}
    >
      {/* Floating Orbs Background */}
      <FloatingOrbs count={3} className="opacity-30" />

      {/* Decorative floating elements with Parallax */}
      <ParallaxLayer speed={0.3} direction="up" className="absolute top-12 right-12 hidden md:block">
        <div className="opacity-5 float-element">
          <Shield className="w-32 h-32 text-black-premium" />
        </div>
      </ParallaxLayer>

      <ParallaxLayer speed={0.5} direction="down" className="absolute bottom-12 left-12 hidden md:block">
        <div className="opacity-5 float-element" style={{ animationDelay: '-3s' }}>
          <HeartPulse className="w-24 h-24 text-black-premium" />
        </div>
      </ParallaxLayer>

      <ParallaxLayer speed={0.4} direction="up" className="absolute top-1/2 right-1/4 -translate-y-1/2 hidden lg:block">
        <div className="opacity-[0.03] float-element" style={{ animationDelay: '-5s' }}>
          <Activity className="w-48 h-48 text-black-premium" />
        </div>
      </ParallaxLayer>

      <Container>
        {/* Header */}
        <motion.div
          className="text-center mb-16 md:mb-20 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          {badge && (
            <motion.span
              className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-black-premium/10 text-black-premium rounded-full border border-black-premium/20"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {badge}
            </motion.span>
          )}
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-black-premium mb-4">
            <SplitText type="words" stagger={0.05}>
              {heading}
            </SplitText>
          </h2>
          {subheading && (
            <motion.p
              className="text-lg md:text-xl text-black-premium/70 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {subheading}
            </motion.p>
          )}
          {/* Animated decorative line */}
          <motion.div
            className="h-1 mx-auto mt-6 rounded-full bg-black-premium/20"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          />
        </motion.div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <TiltCard maxTilt={6} glareEnabled>
                  <div className="h-full p-6 md:p-8 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300">
                    {/* Icon */}
                    <motion.div
                      className="w-14 h-14 mb-5 rounded-xl bg-black-premium/10 border border-black-premium/20 flex items-center justify-center group-hover:bg-black-premium/15 transition-colors duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className="w-7 h-7 text-black-premium" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="font-display font-semibold text-xl text-black-premium mb-2">
                      {item.title}
                    </h3>
                    <p className="text-black-premium/70 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        {ctaText && (
          <motion.div
            className="text-center mt-12 md:mt-16 relative z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <MagneticButton strength={0.4}>
              <Button
                variant="secondary"
                size="lg"
                className="btn-on-gold !bg-black-premium !text-gold-signature hover:!bg-black-deep"
                onClick={ctaAction}
              >
                {ctaText}
              </Button>
            </MagneticButton>
          </motion.div>
        )}
      </Container>
    </section>
  )
}

/**
 * Pre-configured highlight sections for common use cases
 */
export const WhyChooseUsSection = () => {
  const items: HighlightItem[] = [
    {
      icon: Shield,
      title: '100% Digital',
      description: 'Processos ágeis e sem burocracia, tudo pelo celular ou computador.',
    },
    {
      icon: Clock,
      title: 'Preços Competitivos',
      description: 'Planos a partir de R$ 82,00 com o melhor custo-benefício do mercado.',
    },
    {
      icon: Heart,
      title: 'Grandes Parceiros',
      description: 'Planos com Nova Saúde, Ônix e Hapvida Notredame.',
    },
    {
      icon: Phone,
      title: 'Alta Aprovação',
      description: 'Nota 7.0/10 no Reclame Aqui e 80.5% de taxa de resolução.',
    },
    {
      icon: Stethoscope,
      title: 'Ampla Cobertura',
      description: 'Acesso a uma rede credenciada de qualidade para sua saúde.',
    },
    {
      icon: Check,
      title: 'Atendimento Ágil',
      description: 'Suporte eficiente para resolver suas demandas rapidamente.',
    },
  ]

  const handleCTA = () => {
    const phoneNumber = '5521972338589'
    const message = 'Olá! Quero conhecer os diferenciais da Amélia Saúde!'
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <HighlightSection
      variant="medical"
      badge="Por que a Amélia Saúde?"
      heading="Saúde de verdade, sem complicação"
      items={items}
      ctaText="Fale com um especialista"
      ctaAction={handleCTA}
    />
  )
}
