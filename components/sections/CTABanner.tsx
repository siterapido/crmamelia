'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Shield, Heart, HeartPulse } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { MagneticButton, ParallaxLayer, SplitText } from '@/components/animations'

type CTAVariant = 'help' | 'contract' | 'gold' | 'gold-care'

interface CTABannerProps {
  variant: CTAVariant
  heading: string
  subheading?: string
  ctaText: string
}

/**
 * CTA Banner Component
 * Recurring call-to-action sections throughout the page
 * Includes gold variants with healthcare-themed textures
 */
export const CTABanner: React.FC<CTABannerProps> = ({
  variant,
  heading,
  subheading,
  ctaText,
}) => {
  const isGoldVariant = variant === 'gold' || variant === 'gold-care'

  const variantStyles = {
    help: 'bg-gradient-to-r from-gold-primary/8 via-gold-signature/4 to-transparent border-y border-gold-primary/15 gradient-flow',
    contract: 'bg-black-deep border-y border-gold-primary/15 bg-gradient-to-br from-gold-primary/4 via-transparent to-gold-signature/4 ambient-glow particles-gold',
    gold: 'section-gold pattern-shield grain-gold glow-corner-dark border-shimmer-gold',
    'gold-care': 'section-gold-soft pattern-pulse grain-gold glow-corner-dark',
  }

  const textStyles = {
    help: 'text-white',
    contract: 'text-white',
    gold: 'text-black-premium',
    'gold-care': 'text-black-premium',
  }

  const subtextStyles = {
    help: 'text-platinum-light',
    contract: 'text-platinum-light',
    gold: 'text-black-premium/70',
    'gold-care': 'text-black-premium/70',
  }

  // Decorative icons for gold variants
  const DecoIcon = variant === 'gold' ? Shield : HeartPulse

  return (
    <section className={cn('relative py-16 md:py-24 overflow-hidden', variantStyles[variant])}>
      {/* Decorative elements for dark variants */}
      {!isGoldVariant && (
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 bg-gold-signature/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Decorative floating icons for gold variants with Parallax */}
      {isGoldVariant && (
        <>
          <ParallaxLayer speed={0.3} direction="up" className="absolute top-8 left-8">
            <div className="opacity-10 float-element">
              <DecoIcon className="w-16 h-16 text-black-premium" />
            </div>
          </ParallaxLayer>

          <ParallaxLayer speed={0.4} direction="down" className="absolute bottom-8 right-8">
            <div className="opacity-10 float-element" style={{ animationDelay: '-2s' }}>
              <Heart className="w-12 h-12 text-black-premium" />
            </div>
          </ParallaxLayer>

          <ParallaxLayer speed={0.2} direction="up" className="absolute top-1/2 left-1/4 -translate-y-1/2">
            <div className="opacity-5 float-element" style={{ animationDelay: '-4s' }}>
              <Shield className="w-24 h-24 text-black-premium" />
            </div>
          </ParallaxLayer>
        </>
      )}

      <Container>
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Text Content */}
          <div className="relative z-10">
            <h3 className={cn(
              'font-display font-bold text-2xl md:text-3xl mb-2',
              textStyles[variant]
            )}>
              <SplitText type="words" stagger={0.04}>
                {heading}
              </SplitText>
            </h3>
            {subheading && (
              <motion.p
                className={cn('text-lg', subtextStyles[variant])}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                {subheading}
              </motion.p>
            )}
          </div>

          {/* CTA Button */}
          <MagneticButton strength={0.4}>
            <Button
              variant={isGoldVariant ? 'secondary' : 'primary'}
              size="lg"
              className={cn(
                'relative z-10 flex-shrink-0',
                isGoldVariant
                  ? 'btn-on-gold !bg-black-premium !text-gold-primary hover:!bg-black-deep'
                  : 'shadow-gold-glow'
              )}
              onClick={() => {
                const phoneNumber = '5521972229609'
                let message = ''

                if (variant === 'help') {
                  message = 'Olá! Vim pelo site da Amélia Saúde e preciso de ajuda.'
                } else if (variant === 'gold' || variant === 'gold-care') {
                  message = 'Olá! Quero saber mais sobre os planos da Amélia Saúde!'
                } else {
                  message = 'Olá! Tenho interesse em conhecer os planos da Amélia Saúde. Podem me ajudar?'
                }

                const encodedMessage = encodeURIComponent(message)
                window.open(
                  `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
                  '_blank'
                )
              }}
            >
              {ctaText}
            </Button>
          </MagneticButton>
        </motion.div>
      </Container>
    </section>
  )
}
