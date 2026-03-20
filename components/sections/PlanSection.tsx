'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, Map, Users, Briefcase, Heart } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

/**
 * Plans Section
 * Display available health plans with benefits styled cleanly with a yellow background
 */
export const PlanSection = () => {
  const benefits = [
    { 
      title: 'Atendimento Ágil', 
      description: 'Processos ágeis e sem burocracia, tudo pelo celular ou computador.',
      icon: <Zap className="w-5 h-5 text-black" /> 
    },
    { 
      title: 'Preços competitivos', 
      description: 'Planos a partir de R$ 82,00 com o melhor custo-benefício do mercado.',
      icon: <Clock className="w-5 h-5 text-black" /> 
    },
    { 
      title: 'Ampla cobertura', 
      description: 'As melhores opções de atendimento na sua região com as principais operadoras.',
      icon: <Map className="w-5 h-5 text-black" /> 
    },
    { 
      title: 'Plano coletivo por adesão', 
      description: 'Condições especiais para profissionais ligados a entidades de classe.',
      icon: <Users className="w-5 h-5 text-black" /> 
    },
    { 
      title: 'Plano empresarial', 
      description: 'Proteja sua equipe com os melhores planos corporativos para sua empresa.',
      icon: <Briefcase className="w-5 h-5 text-black" /> 
    },
    { 
      title: 'Planos Corporativos', 
      description: 'Planos com Nova Saúde, Ônix e Hapvida Notredame.',
      icon: <Heart className="w-5 h-5 text-black" /> 
    }
  ]

  return (
    <section id="plans" className="relative py-20 md:py-32 bg-[#FFCD00] overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="mb-16 md:mb-20 text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-6 py-2 rounded-full border border-black/20 text-black text-xs md:text-sm font-semibold mb-6 tracking-wide"
          >
            Planos de saúde feitos para você
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-medium text-4xl md:text-5xl lg:text-6xl text-black tracking-tight mb-6"
          >
            Saúde de verdade, sem complicação
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-black/80 text-lg md:text-xl max-w-2xl px-4"
          >
            As melhores operadoras do mercado para lhe proporcionar a melhor experiência em planos de saúde
          </motion.p>
        </div>

        {/* Benefits Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto relative z-10 w-full mb-16 px-2 sm:px-4">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              viewport={{ once: true }}
              className="bg-[#FFE14D] rounded-[24px] p-8 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-2xl border border-black/10 flex items-center justify-center mb-6 bg-transparent">
                {benefit.icon}
              </div>
              <h3 className="text-black font-semibold text-xl mb-2">
                {benefit.title}
              </h3>
              <p className="text-black/70 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center w-full relative z-10"
        >
          <Button 
            variant="black"
            size="lg" 
            className="w-[90%] sm:w-auto shadow-[0_10px_30px_rgba(0,0,0,0.15)] max-w-[400px] whitespace-nowrap px-8 sm:px-12"
          >
            Solicitar Cotação
          </Button>
        </motion.div>
      </Container>
    </section>
  )
}
