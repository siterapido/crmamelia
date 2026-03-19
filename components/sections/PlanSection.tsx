'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, DollarSign, Map, Users, Briefcase } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TiltCard, MagneticButton } from '@/components/animations'

/**
 * Plans Section
 * Display available health plans with benefits
 */
export const PlanSection = () => {
  const benefits = [
    { title: 'Atendimento Ágil', icon: <Zap className="w-8 h-8 text-black" /> },
    { title: 'Preços competitivos', icon: <DollarSign className="w-8 h-8 text-black" /> },
    { title: 'Ampla cobertura', icon: <Map className="w-8 h-8 text-black" /> },
    { title: 'Plano coletivo por adesão', icon: <Users className="w-8 h-8 text-black" /> },
    { title: 'Plano empresarial', icon: <Briefcase className="w-8 h-8 text-black" /> }
  ]

  return (
    <section id="plans" className="relative py-24 md:py-32 lg:py-48 glass-section-dark glass-overlay noise-overlay spotlight-gold aurora-dark overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="mb-16 md:mb-24 text-center">
          <SectionHeader
            title="Planos de saúde feitos"
            highlight="para você"
            subtitle="Saúde de verdade, sem complicação"
          />
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-platinum mt-6 max-w-2xl mx-auto text-lg md:text-xl px-4"
          >
            As melhores operadoras do mercado para lhe proporcionar a melhor experiência em planos de saúde
          </motion.p>
        </div>

        {/* Benefits Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16 px-4 relative z-10 w-full">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              viewport={{ once: true, margin: '-50px' }}
              className="h-full"
            >
              <TiltCard maxTilt={5} glareEnabled={false} className="h-full">
                <Card variant="gold-glass" className="h-full group hover:-translate-y-2 transition-transform duration-300">
                  <CardContent className="p-6 md:p-8 flex flex-col items-center text-center justify-center min-h-[220px]">
                    <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-black/15 transition-all duration-300">
                      {benefit.icon}
                    </div>
                    <h3 className="text-black font-semibold text-lg md:text-xl leading-snug">
                      {benefit.title}
                    </h3>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center w-full mt-10 md:mt-16 relative z-10"
        >
          <Button 
            variant="primary"
            size="lg" 
            className="w-[90%] sm:w-auto shadow-gold-sm hover:shadow-gold-glow max-w-[400px] whitespace-nowrap px-8 sm:px-12"
          >
            Solicitar Cotação
          </Button>
        </motion.div>


      </Container>
    </section>
  )
}
