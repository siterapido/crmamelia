'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, UserCheck, Sparkles, HelpCircle, Shield } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/components/layout/Footer'
import { AIChatWidget } from '@/components/ui/AIChatWidget'
import { SectionHeader } from '@/components/ui/SectionHeader'

const FLOW_STEPS = [
  {
    title: 'Você envia uma mensagem',
    description:
      'Pelo WhatsApp ou pelo chat no site da Amélia Saúde — por exemplo, ao clicar em "Quero Contratar".',
  },
  {
    title: 'A Amélia acolhe e entende',
    description:
      'Nossa assistente virtual responde como uma consultora: com empatia, sem formulário robotizado.',
  },
  {
    title: 'Tire dúvidas com informações reais',
    description:
      'Ela pode explicar benefícios, operadoras parceiras (Nova Saúde, Ônix, Hapvida Notre Dame), tipos de plano e perguntas frequentes do site.',
  },
  {
    title: 'Conversa para conhecer você',
    description:
      'De forma natural, ela pergunta o que ainda precisa saber: nome, se é pessoa física ou empresa, cidade, quantas pessoas no plano, plano atual e prazo para contratar.',
  },
  {
    title: 'Um consultor humano assume',
    description:
      'Quando as informações estão completas — ou se você pedir — um especialista entra para montar a proposta e valores certos para o seu caso.',
  },
]

const CAN_DO = [
  'Explicar como funcionam os planos e a Amélia como administradora',
  'Responder dúvidas do site (carteirinha, boleto, carência, canais de contato)',
  'Mencionar referência "a partir de R$ 82" com ressalva de confirmação pelo consultor',
  'Organizar seus dados para agilizar o atendimento humano',
]

const CANNOT_DO = [
  'Fechar contrato ou garantir preço final sem um consultor',
  'Inventar rede de hospitais por cidade ou promoções',
  'Substituir o especialista em propostas e negociação',
]

const MINI_FAQ = [
  {
    q: 'A Amélia é um robô?',
    a: 'É uma assistente com inteligência artificial, treinada com o conteúdo oficial do site e focada em te ajudar antes do consultor humano.',
  },
  {
    q: 'Posso falar com uma pessoa a qualquer momento?',
    a: 'Sim. Basta pedir na conversa que a Amélia encaminha para nosso time.',
  },
  {
    q: 'Meus dados ficam guardados?',
    a: 'As informações da conversa são registradas para que o consultor continue o atendimento com contexto, em conformidade com nossa política de privacidade.',
  },
]

export default function ComoFuncionaPage() {
  const openWhatsApp = () => {
    const phone = '5521972338589'
    const text = encodeURIComponent(
      'Olá! Tenho interesse em conhecer os planos da Amélia Saúde. Podem me ajudar?'
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center bg-black-premium pt-28 pb-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-gold-primary" />
              <span className="text-gold-primary text-sm font-medium">Atendimento inteligente</span>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-6">
              Como funciona a <span className="text-gold-primary">Amélia</span>
            </h1>
            <p className="text-platinum text-lg leading-relaxed">
              Entenda o passo a passo do atendimento virtual antes do consultor humano — de forma
              transparente e sem termos técnicos.
            </p>
          </motion.div>
        </Container>
      </section>

      <section className="py-20 md:py-28 glass-section-dark">
        <Container>
          <SectionHeader
            title="O fluxo em"
            highlight="5 passos"
            subtitle="Do primeiro contato até o especialista"
          />
          <div className="mt-12 space-y-4 max-w-2xl mx-auto">
            {FLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-5 rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-primary/20 text-gold-primary font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-platinum text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-black-deep">
        <Container>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" /> O que a Amélia pode fazer
              </h2>
              <ul className="space-y-2 text-platinum text-sm">
                {CAN_DO.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" /> O que a Amélia não faz
              </h2>
              <ul className="space-y-2 text-platinum text-sm">
                {CANNOT_DO.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-amber-400">×</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="max-w-2xl">
          <h2 className="font-display text-2xl text-white mb-8 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-gold-primary" />
            Perguntas rápidas
          </h2>
          <div className="space-y-6">
            {MINI_FAQ.map((item) => (
              <div key={item.q} className="border-b border-white/10 pb-6">
                <h3 className="text-white font-medium mb-2">{item.q}</h3>
                <p className="text-platinum text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 bg-gradient-to-r from-gold-primary/10 to-transparent border-y border-gold-primary/20">
        <Container className="text-center">
          <UserCheck className="w-12 h-12 text-gold-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-platinum mb-8 max-w-lg mx-auto">
            Fale com a Amélia agora pelo WhatsApp ou use o chat no site.
          </p>
          <Button variant="primary" size="lg" onClick={openWhatsApp}>
            Quero Contratar pelo WhatsApp
          </Button>
        </Container>
      </section>

      <Footer />
      <AIChatWidget />
    </>
  )
}
