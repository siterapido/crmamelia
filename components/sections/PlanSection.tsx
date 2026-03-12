'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, Building2, Check, Clock, TrendingDown, Shield } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TiltCard, MagneticButton } from '@/components/animations'
import { cn } from '@/lib/utils/cn'

/**
 * Plans Section
 * Display available health plans with benefits
 */
export const PlanSection = () => {
  const plans = [
    {
      icon: User,
      title: 'Plano Coletivo por Adesão',
      description: 'Preços negociados coletivamente para associações, sindicatos e conselhos profissionais.',
      badge: 'Melhor Custo-Benefício',
      benefits: [
        'A partir de R$ 82,00*',
        'Parceiros: Nova Saúde, Ônix, Hapvida',
        'Inclusão de dependentes',
      ],
    },
    {
      icon: Building2,
      title: 'Planos Empresariais',
      description: 'Soluções completas para gestão de saúde da sua empresa.',
      benefits: [
        'Gestão 100% digital',
        'Sem burocracia na contratação',
        'Suporte especializado para RH',
      ],
    },
  ]

  return (
    <section id="plans" className="relative py-24 md:py-32 lg:py-48 glass-section-dark glass-overlay noise-overlay spotlight-gold aurora-dark">
      <Container>
        {/* Section Header */}
        <div className="mb-16 md:mb-20">
          <SectionHeader
            title="Planos de saúde feitos"
            highlight="para você"
            subtitle="Saúde de verdade, sem complicação. As melhores operadoras do mercado para lhe proporcionar a melhor experiência em planos de saúde"
          />
        </div>

        {/* Highlight Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 md:mb-24">
          {[
            { icon: Clock, label: 'Atendimento Ágil' },
            { icon: TrendingDown, label: 'Preços competitivos' },
            { icon: Shield, label: 'Ampla cobertura' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 p-4 rounded-xl bg-gold-primary/10 border border-gold-primary/20"
            >
              <div className="w-10 h-10 rounded-lg bg-gold-primary/20 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-gold-primary" />
              </div>
              <span className="font-display font-medium text-lg text-platinum">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const floatDelayClass = index === 0 ? 'card-premium-float' : 'card-premium-float-delay-2'
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: '-100px' }}
                className={`${floatDelayClass} h-full`}
              >
                <TiltCard maxTilt={3} glareEnabled={false} className="h-full">
                  <Card variant="gold-glass" className="group h-full">
                    <CardContent className="p-6 md:p-8 relative z-10 flex flex-col h-full">
                      {/* Icon */}
                      <div className="mb-5">
                        <div className="w-14 h-14 rounded-xl bg-black/10 border border-black/10 flex items-center justify-center">
                          <Icon className="w-7 h-7 text-black" />
                        </div>
                      </div>

                      {/* Badge */}
                      {plan.badge && (
                        <span className="inline-block mb-3 px-2.5 py-1 text-xs font-medium bg-black/10 text-black border border-black/20 rounded-xl">
                          {plan.badge}
                        </span>
                      )}

                      {/* Content */}
                      <h3 className="font-display font-bold text-xl md:text-2xl text-black mb-2">
                        {plan.title}
                      </h3>
                      <p className="text-black/80 text-sm md:text-base mb-6 leading-relaxed">
                        {plan.description}
                      </p>

                      {/* Benefits */}
                      <ul className="space-y-2.5 mb-8 flex-grow">
                        {plan.benefits.map((benefit, idx) => (
                          <motion.li
                            key={idx}
                            className="flex items-center gap-2.5"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <Check className="w-4 h-4 text-black flex-shrink-0" />
                            <span className="text-black/80 text-sm">{benefit}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <MagneticButton strength={0.2} className="w-full mt-auto">
                        <button className="w-full py-3 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-black/90 transition-colors">
                          {index === 0 ? 'Quero Contratar' : 'Solicitar Cotação'}
                        </button>
                      </MagneticButton>
                    </CardContent>
                  </Card>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>

        {/* Help CTA */}
        <motion.div
          className="text-center mt-16 md:mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <p className="text-platinum mb-4">Ainda com dúvidas sobre qual plano escolher?</p>
          <MagneticButton strength={0.3}>
            <Button variant="secondary">Fale com um consultor</Button>
          </MagneticButton>
        </motion.div>
      </Container>
    </section>
  )
}
