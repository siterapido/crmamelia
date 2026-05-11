'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Shield, Heart, Eye, Target, Users, Award, Headphones, Calendar, TrendingUp, CheckCircle, Sparkles, ChevronDown } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/components/layout/Footer'
import { AIChatWidget } from '@/components/ui/AIChatWidget'
import { FloatingOrbs, ParallaxLayer } from '@/components/animations'

/**
 * Sobre (About) Page - Premium Edition
 * Company history, mission, vision, values, and impact numbers
 * Enhanced with modern animations and design elements
 */
export default function SobrePage() {
  const { scrollY } = useScroll()
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 100], [1, 0])

  const values = [
    {
      icon: Heart,
      title: 'Missão',
      description:
        'Facilitar o acesso à saúde de qualidade, conectando pessoas a planos que realmente cuidam delas, com transparência e agilidade.',
    },
    {
      icon: Eye,
      title: 'Visão',
      description:
        'Ser referência nacional em administração de benefícios de saúde, reconhecida pela excelência no atendimento e inovação contínua.',
    },
    {
      icon: Target,
      title: 'Valores',
      description:
        'Transparência, compromisso com o cliente, inovação, ética e respeito às pessoas estão no centro de tudo que fazemos.',
    },
  ]

  const timeline = [
    {
      year: '2014',
      title: 'Fundação',
      description: 'Nascemos com o propósito de transformar a relação das pessoas com seus planos de saúde.',
    },
    {
      year: '2017',
      title: 'Registro ANS',
      description: 'Conquistamos o registro AAA na Agência Nacional de Saúde Suplementar.',
    },
    {
      year: '2020',
      title: 'Expansão Digital',
      description: 'Lançamento da plataforma de autoatendimento e gestão inteligente de benefícios.',
    },
    {
      year: '2024',
      title: 'Liderança Nacional',
      description: 'Mais de 5.000 clientes ativos e 98% de satisfação no atendimento.',
    },
  ]

  const differentials = [
    {
      icon: Shield,
      title: 'Registro ANS',
      description: 'Administradora AAA registrada e regulamentada pela Agência Nacional de Saúde Suplementar.',
    },
    {
      icon: Headphones,
      title: 'Suporte 24/7',
      description: 'Time de especialistas sempre pronto para ajudar, a qualquer hora do dia ou da noite.',
    },
    {
      icon: Award,
      title: '10+ Anos',
      description: 'Mais de uma década de experiência cuidando da saúde de milhares de famílias brasileiras.',
    },
    {
      icon: Users,
      title: '5.000+ Clientes',
      description: 'Milhares de clientes satisfeitos que confiam na Amélia Saúde para cuidar do que mais importa.',
    },
  ]

  const stats = [
    { number: '10+', label: 'Anos de experiência' },
    { number: '5.000+', label: 'Clientes ativos' },
    { number: '98%', label: 'Satisfação' },
    { number: '24/7', label: 'Suporte disponível' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  return (
    <>
      {/* Hero Section - Split Layout Premium */}
      <section className="relative min-h-screen w-full overflow-hidden bg-black-premium">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-primary/15 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold-signature/10 via-transparent to-transparent" />
          {/* Animated grid lines */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Floating Orbs */}
        <FloatingOrbs count={3} />

        {/* Main Content - Split Layout */}
        <div className="relative z-10 min-h-screen">
          <Container className="h-full min-h-screen flex items-center pt-24 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

              {/* Left Column - Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="order-2 lg:order-1"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mb-6"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-signature/10 border border-gold-signature/20 text-gold-signature text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Administradora AAA Registrada
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  className="font-display font-bold text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="text-white">Somos a </span>
                  <span className="text-gradient">Amélia Saúde</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  className="text-base md:text-lg lg:text-xl text-platinum-light leading-relaxed mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                >
                  Há mais de uma década transformando a relação das famílias brasileiras com seus planos de saúde através de <strong className="text-white">transparência</strong>, <strong className="text-white">tecnologia</strong> e <strong className="text-white">atendimento humanizado</strong>.
                </motion.p>

                {/* Values Pills */}
                <motion.div
                  className="flex flex-wrap gap-3 mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                >
                  {['Ética', 'Inovação', 'Compromisso', 'Excelência'].map((value, i) => (
                    <span
                      key={value}
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-platinum text-sm font-medium hover:bg-white/10 hover:border-gold-signature/30 transition-all duration-300 cursor-default"
                    >
                      {value}
                    </span>
                  ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.7 }}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="shadow-gold-lg"
                    onClick={() => {
                      document.getElementById('historia-section')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Conheça Nossa História
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="!border-white/20 !text-white hover:!bg-white/10"
                    onClick={() => {
                      const phoneNumber = '5511999999999'
                      const message = 'Olá! Vim da página Sobre e gostaria de saber mais sobre a Amélia Saúde.'
                      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
                    }}
                  >
                    Falar Conosco
                  </Button>
                </motion.div>

                {/* Mobile Stats - visível apenas em mobile */}
                <motion.div
                  className="flex flex-wrap justify-center gap-6 mt-10 md:hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.7 }}
                >
                  {stats.slice(0, 3).map((stat, index) => (
                    <div key={index} className="text-center">
                      <p className="text-2xl font-bold text-gradient">{stat.number}</p>
                      <p className="text-xs text-platinum">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Column - Stats Cards */}
              <motion.div
                className="order-1 lg:order-2 hidden md:block"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className={`group relative overflow-hidden rounded-2xl p-6 md:p-8 backdrop-blur-sm border transition-all duration-500 cursor-default ${index === 0
                        ? 'bg-gradient-to-br from-gold-signature/20 to-gold-primary/10 border-gold-signature/30 col-span-2'
                        : 'bg-white/5 border-white/10 hover:border-gold-signature/30 hover:bg-white/8'
                        }`}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10">
                        <motion.p
                          className={`font-bold mb-2 ${index === 0
                            ? 'text-5xl md:text-6xl text-gradient'
                            : 'text-4xl md:text-5xl text-white group-hover:text-gradient transition-all duration-300'
                            }`}
                        >
                          {stat.number}
                        </motion.p>
                        <p className={`font-medium ${index === 0 ? 'text-gold-signature text-base' : 'text-platinum text-sm'
                          }`}>
                          {stat.label}
                        </p>
                      </div>

                      {/* Decorative corner */}
                      {index === 0 && (
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-signature/20 rounded-full blur-2xl" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </div>
          </Container>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          style={{ opacity: scrollIndicatorOpacity }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
        >
          <button
            onClick={() => {
              document.getElementById('historia-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="flex flex-col items-center gap-2 text-gold-signature/50 hover:text-gold-signature transition-colors"
            aria-label="Scroll para próxima seção"
          >
            <ChevronDown size={24} />
          </button>
        </motion.div>
      </section>

      {/* Timeline Section - Gold Background */}
      <section id="historia-section" className="relative py-24 md:py-32 section-gold-soft pattern-shield grain-gold overflow-hidden">
        {/* Corner glow effects */}
        <div className="glow-corner-dark" />

        <Container>
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2 className="font-display font-semibold text-h2 text-black-premium mb-4">
              Nossa Trajetória
            </h2>
            <p className="text-xl text-black-premium/70 max-w-2xl mx-auto">
              Uma década de dedicação em transformar o mercado de saúde suplementar
            </p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            className="relative max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black-premium/20 hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative flex flex-col md:flex-row gap-6 md:gap-12 items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                >
                  {/* Year Badge */}
                  <div className="md:flex-1 text-center md:text-right">
                    <div className={`inline-block ${index % 2 === 0 ? 'md:float-left' : 'md:float-right'}`}>
                      <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black-premium text-gold-signature font-bold text-xl shadow-lg">
                        {item.year}
                      </span>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="md:flex-1">
                    <div className="bg-white/20 backdrop-blur-sm border border-black-premium/10 rounded-2xl p-6 shadow-lg">
                      <h3 className="font-display font-semibold text-2xl text-black-premium mb-2">
                        {item.title}
                      </h3>
                      <p className="text-black-premium/70 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Mission, Vision, Values - Premium Cards */}
      <section className="relative py-24 md:py-32 bg-black-premium overflow-hidden">
        {/* Ambient glow */}
        <div className="ambient-glow" />

        <Container>
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2 className="font-display font-semibold text-h2 mb-4">
              Nosso Propósito
            </h2>
            <p className="text-xl text-platinum-light max-w-2xl mx-auto">
              Os princípios que guiam cada decisão e cada atendimento
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="relative h-full rounded-2xl bg-gradient-to-br from-black-charcoal to-black-deep border border-gold-signature/20 p-8 overflow-hidden transition-all duration-500 hover:border-gold-signature/40 hover:shadow-gold-md card-premium-float">
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gold-signature/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-gold-sm">
                          <Icon className="w-10 h-10 text-gold-signature" />
                        </div>
                      </div>
                      <h3 className="font-display font-semibold text-2xl mb-4 text-center">
                        {value.title}
                      </h3>
                      <p className="text-platinum leading-relaxed text-center">
                        {value.description}
                      </p>
                    </div>

                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-signature/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* Differentials - Glass Cards */}
      <section className="relative py-24 md:py-32 glass-section-dark overflow-hidden">
        <Container>
          <motion.div
            className="text-center mb-16 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2 className="font-display font-semibold text-h2 mb-4">
              Por que escolher a Amélia Saúde?
            </h2>
            <p className="text-xl text-platinum-light max-w-2xl mx-auto">
              Diferenciais que fazem da gente uma referência no mercado
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {differentials.map((diff, index) => {
              const Icon = diff.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="h-full glass-gold-strong rounded-xl p-6 transition-all duration-500 hover:shadow-gold-md hover:-translate-y-2 card-float">
                    <div className="mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gold-signature/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <Icon className="w-7 h-7 text-gold-signature" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-xl mb-3 text-white">
                      {diff.title}
                    </h3>
                    <p className="text-platinum-light text-sm leading-relaxed">
                      {diff.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* Impact Numbers - Premium */}
      <section className="relative py-24 md:py-32 bg-black-premium overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 animate-mesh-float" />

        <Container>
          <motion.div
            className="text-center mb-16 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2 className="font-display font-semibold text-h2 mb-4">
              Nosso Impacto
            </h2>
            <p className="text-xl text-platinum-light max-w-2xl mx-auto">
              Números que refletem nosso compromisso com a excelência
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={itemVariants}
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="mb-4"
                >
                  <p className="text-6xl md:text-7xl font-bold text-gradient group-hover:scale-110 transition-transform duration-500">
                    {stat.number}
                  </p>
                </motion.div>
                <p className="text-platinum text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Final CTA - Gold Section */}
      <section className="relative py-24 md:py-32 section-gold-soft pattern-medical-cross grain-gold overflow-hidden">
        <div className="glow-corner-dark" />

        <Container>
          <motion.div
            className="text-center max-w-3xl mx-auto relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="mb-8">
              <CheckCircle className="w-16 h-16 text-black-premium mx-auto mb-4" />
            </div>
            <h2 className="font-display font-semibold text-h2 text-black-premium mb-6">
              Pronto para fazer parte da nossa história?
            </h2>
            <p className="text-xl text-black-premium/70 mb-10 leading-relaxed">
              Junte-se a milhares de clientes que já confiam na Amélia Saúde para cuidar
              do que mais importa: a saúde de quem você ama.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="btn-on-gold shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
                onClick={() => {
                  const phoneNumber = '5511999999999'
                  const message = 'Olá! Vim da página Sobre e gostaria de conhecer os planos da Amélia Saúde.'
                  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
                }}
              >
                Quero Contratar
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="!bg-white/20 !border-black-premium/15 !text-black-premium hover:!bg-white/30"
                onClick={() => {
                  const phoneNumber = '5511999999999'
                  const message = 'Olá! Vim da página Sobre e preciso de ajuda.'
                  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
                }}
              >
                Falar com Especialista
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <Footer />

      {/* AI Chat Widget */}
      <AIChatWidget />
    </>
  )
}
