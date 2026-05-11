'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Footer } from '@/components/layout/Footer'
import { AIChatWidget } from '@/components/ui/AIChatWidget'

interface LegalPageLayoutProps {
  title: string
  subtitle: string
  lastUpdated: string
  children: React.ReactNode
}

/**
 * Shared layout for legal pages (Privacidade, Termos, LGPD)
 */
export const LegalPageLayout = ({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalPageLayoutProps) => {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-black-premium pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />

        <Container>
          <motion.div
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-gold-signature text-sm font-semibold uppercase tracking-widest mb-4">
              {subtitle}
            </span>
            <h1 className="font-display font-bold text-h2 md:text-h1 mb-4">
              {title}
            </h1>
            <p className="text-platinum">
              Ultima atualizacao: {lastUpdated}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Content */}
      <section className="relative py-12 md:py-16 bg-black-charcoal">
        <Container>
          <motion.div
            className="max-w-4xl prose prose-invert prose-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-8 text-platinum-light leading-relaxed">
              {children}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Contact CTA */}
      <section className="relative py-16 bg-black-premium border-t border-white/5">
        <Container>
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-platinum mb-2">
              Tem duvidas sobre este documento?
            </p>
            <a
              href="mailto:privacidade@ameliasaude.com.br"
              className="text-gold-signature hover:text-gold-light font-semibold transition-colors"
            >
              Entre em contato: privacidade@ameliasaude.com.br
            </a>
          </motion.div>
        </Container>
      </section>

      <Footer />
      <AIChatWidget />
    </>
  )
}
