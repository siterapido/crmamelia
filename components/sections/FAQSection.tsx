'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, MessageCircle, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { MagneticButton, GradientText } from '@/components/animations'

/**
 * FAQ Section
 * Accordion with frequently asked questions - Premium Gold Design
 */
export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'Quando recebo minha carteirinha digital?',
      answer:
        'Você terá acesso à sua carteirinha digital a partir da data de início da vigência do contrato, diretamente pelo Aplicativo Amélia Saúde.',
    },
    {
      question: 'Como realizo o pagamento das mensalidades?',
      answer:
        'O pagamento é feito via boleto digital, enviado mensalmente por e-mail e SMS. Você também pode acessar pelo nosso site ou WhatsApp. O boleto é registrado e permite pagamento após o vencimento com atualização automática.',
    },
    {
      question: 'Quando posso começar a usar o plano?',
      answer:
        'O uso do plano é liberado a partir da data de início da vigência expressa no seu contrato.',
    },
    {
      question: 'Como funcionam as carências?',
      answer:
        'A carência é o tempo de espera para realizar certos procedimentos. Seguimos os prazos máximos da ANS, mas eles podem ser reduzidos promocionalmente. Consulte sua proposta para detalhes específicos.',
    },
    {
      question: 'O que é Cobertura Parcial Temporária (CPT)?',
      answer:
        'É um período de restrição para procedimentos de alta complexidade e cirurgias relacionados a doenças pré-existentes. Consultas e atendimentos de urgência/emergência não são afetados.',
    },
    {
      question: 'Como entrar em contato com o suporte?',
      answer:
        'Estamos disponíveis pelo telefone 0800-000-5123 e WhatsApp (21) 97233-8589, de segunda a sexta, das 9h às 18h.',
    },
  ]

  return (
    <section id="faq" className="relative py-24 md:py-32 lg:py-48 glass-section-dark glass-overlay noise-overlay shine-diagonal vignette-gold">
      <Container>
        {/* Premium Header */}
        <div className="mb-16 md:mb-24 text-center space-y-6">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <HelpCircle className="w-4 h-4 text-gold-primary" />
            <span className="text-gold-primary text-sm font-medium">Tire suas dúvidas</span>
          </motion.div>

          <motion.h2
            className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Perguntas <GradientText className="font-bold">Frequentes</GradientText>
          </motion.h2>

          <motion.p
            className="text-platinum text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Encontre respostas rápidas para as dúvidas mais comuns
          </motion.p>

          <motion.div
            className="h-1 bg-gradient-to-r from-gold-primary to-gold-signature rounded-full mx-auto"
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 100, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          />
        </div>

        {/* FAQ Accordion - Premium Style */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true, margin: '-50px' }}
              className="group"
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full bg-black-deep/80 backdrop-blur-sm rounded-2xl p-6 text-left transition-all duration-500 ${openIndex === index
                    ? 'border-2 border-gold-primary/60 shadow-[0_0_30px_rgba(245,166,35,0.2)]'
                    : 'border border-gold-primary/20 hover:border-gold-primary/40 shadow-[0_0_20px_rgba(245,166,35,0.05)] hover:shadow-[0_0_25px_rgba(245,166,35,0.1)]'
                  }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex items-center gap-4">
                  {/* Number indicator */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm transition-all duration-300 ${openIndex === index
                      ? 'bg-gradient-to-br from-gold-primary to-gold-signature text-black-premium shadow-[0_4px_15px_rgba(245,166,35,0.4)]'
                      : 'bg-gold-primary/10 text-gold-primary border border-gold-primary/30'
                    }`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <h3 className={`flex-1 font-semibold text-lg md:text-xl pr-4 transition-colors duration-300 ${openIndex === index ? 'text-gold-primary' : 'text-white group-hover:text-gold-light'
                    }`}>
                    {faq.question}
                  </h3>

                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${openIndex === index
                        ? 'bg-gold-primary/20 border border-gold-primary/40'
                        : 'bg-gold-primary/5 border border-gold-primary/20'
                      }`}
                  >
                    <ChevronDown
                      size={20}
                      className={`text-gold-primary transition-all duration-300 ${openIndex === index ? 'drop-shadow-[0_0_8px_rgba(245,166,35,0.6)]' : ''
                        }`}
                    />
                  </motion.div>
                </div>
              </motion.button>

              {/* Answer - Premium Style */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="mx-4 bg-gradient-to-br from-gold-primary/5 via-black-deep/90 to-gold-signature/5 border-x-2 border-b-2 border-gold-primary/30 rounded-b-2xl p-6 shadow-[inset_0_4px_20px_rgba(245,166,35,0.05)]">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-1 bg-gradient-to-b from-gold-primary to-gold-signature rounded-full" />
                        <p className="text-platinum/90 leading-relaxed text-base">{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA - Premium */}
        <motion.div
          className="text-center mt-16 md:mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="inline-flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-gold-primary/10 via-black-deep/50 to-gold-signature/10 border border-gold-primary/30 rounded-3xl shadow-[0_0_40px_rgba(245,166,35,0.1)]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-gold-primary" />
              <p className="text-white font-medium text-lg">Não encontrou sua resposta?</p>
            </div>
            <MagneticButton strength={0.3}>
              <Button variant="primary" className="shadow-[0_4px_20px_rgba(245,166,35,0.3)]">
                <MessageCircle className="w-4 h-4 mr-2" />
                Fale com um especialista
              </Button>
            </MagneticButton>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
