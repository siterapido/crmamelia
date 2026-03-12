'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Shield } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TiltCard, MagneticButton } from '@/components/animations'
import { cn } from '@/lib/utils/cn'

/**
 * Plans Section
 * Display available health plans with benefits
 */
export const PlanSection = () => {
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

        {/* Unified Plan Block */}
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
            className="card-premium-float"
          >
            <TiltCard maxTilt={3} glareEnabled={false} className="h-full">
              <Card variant="gold-glass" className="group overflow-hidden">
                <CardContent className="p-8 md:p-14 relative z-10 flex flex-col items-center text-center">
                  {/* Decorative Icon Wrapper */}
                  <div className="mb-8 p-4 rounded-2xl bg-black/5 border border-black/10">
                    <div className="w-16 h-16 rounded-xl bg-black/10 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-black" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-3xl md:text-5xl text-black mb-6 leading-tight">
                    Tudo o que você precisa em um só lugar
                  </h3>
                  
                  <p className="text-black/80 text-lg md:text-xl mb-12 w-full max-w-2xl mx-auto">
                    Soluções completas e atendimento personalizado para garantir sua tranquilidade e segurança.
                  </p>

                  {/* Unified Benefits Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-12 text-left w-full max-w-3xl">
                    {[
                      'Atendimento Ágil',
                      'Preços competitivos',
                      'Ampla cobertura',
                      'Plano coletivo por adesão',
                      'Plano empresarial'
                    ].map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-black font-semibold text-base md:text-lg">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Unified CTA */}
                  <div className="w-full flex justify-center mt-2">
                    <MagneticButton strength={0.3} className="w-full max-w-lg">
                      <Button 
                        variant="black"
                        size="lg" 
                        fullWidth 
                        className="shadow-2xl"
                      >
                        Solicitar Cotação
                      </Button>
                    </MagneticButton>
                  </div>
                </CardContent>
              </Card>
            </TiltCard>
          </motion.div>
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
