'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  FileText,
  Search,
  Clock,
  Calendar,
  Bell,
  Download,
  Star,
  Users,
  CheckCircle2
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { PhoneVisualization } from '@/components/ui/PhoneVisualization'

/**
 * Mobile App Section
 * Showcase app features with premium 3D visualization and interactive elements
 */
export const AppSection = () => {
  const features = [
    {
      icon: CreditCard,
      title: 'Carteirinha Digital',
      description: 'Sempre disponível, mesmo sem internet',
    },
    {
      icon: FileText,
      title: 'Boletos Digitais',
      description: 'Consulte e pague seus boletos no app',
    },
    {
      icon: Search,
      title: 'Demonstrativo de IR',
      description: 'Baixe seu informe para declaração',
    },
    {
      icon: Clock,
      title: 'Gestão do Contrato',
      description: 'Acompanhe dados cadastrais e do plano',
    },
    {
      icon: Calendar,
      title: 'Rede Credenciada',
      description: 'Encontre médicos perto de você',
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Lembretes de pagamentos e novidades',
    },
  ]

  const stats = [
    { icon: Users, value: '50k+', label: 'Downloads' },
    { icon: Star, value: '4.8', label: 'Avaliação' },
    { icon: CheckCircle2, value: '24/7', label: 'Disponível' },
  ]

  return (
    <section className="relative py-24 md:py-32 lg:py-48 glass-section-dark glass-overlay noise-overlay ambient-glow pattern-hex overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Phone Visualization */}
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <PhoneVisualization />
          </motion.div>

          {/* Right - Content */}
          <motion.div
            className="space-y-8 order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Header */}
            <div className="space-y-4">
              <motion.h2
                className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gradient"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Tudo na palma da sua mão
              </motion.h2>
              <motion.p
                className="text-lg md:text-xl text-platinum-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Gerencie seu plano, consulte a rede credenciada e muito mais pelo aplicativo Amélia Saúde
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={index}
                    className="text-center space-y-2 p-4 rounded-2xl bg-gold-primary/5 border border-gold-primary/10 hover:border-gold-primary/30 transition-all duration-300 group"
                  >
                    <Icon className="w-5 h-5 text-gold-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-platinum">{stat.label}</div>
                  </div>
                )
              })}
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    className="group relative space-y-3 p-4 rounded-2xl bg-gradient-to-br from-gold-primary/5 to-transparent border border-gold-primary/10 hover:border-gold-primary/30 transition-all duration-300 card-radial-hover"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-primary/25 transition-colors duration-300">
                        <Icon className="w-5 h-5 text-gold-primary icon-glow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-platinum leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Download CTA */}
            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}
            >
              <Button
                variant="primary"
                size="lg"
                icon={<Clock size={20} />}
                className="opacity-70 cursor-not-allowed"
                disabled
              >
                Em breve
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </Container>

      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gold-signature/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
