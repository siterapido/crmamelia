import type { Metadata } from 'next'
import { HeroSectionGold } from '@/components/sections/HeroSectionGold'
import { ClientSection } from '@/components/sections/ClientSection'
import { PlanSection } from '@/components/sections/PlanSection'
import { SocialProofSection } from '@/components/sections/SocialProofSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { LatestNewsSection } from '@/components/sections/LatestNewsSection'
import { Footer } from '@/components/layout/Footer'
import { AIChatWidget } from '@/components/ui/AIChatWidget'

export const metadata: Metadata = {
  title: 'SIX Saúde | Planos de Saúde Premium com Atendimento Humano',
  description:
    'Planos de saúde com transparência, agilidade e atendimento 24/7. Administradora AAA registrada na ANS. Autoatendimento rápido e suporte especializado.',
}

/**
 * Landing Page 2 - Gold Hero Variant
 * Same structure as homepage but with gold background hero (no family photo)
 */
export default function LandingPage2() {
  return (
    <>
      {/* Hero Section - Gold Background Variant */}
      <HeroSectionGold />

      {/* Client Self-Service Section */}
      <ClientSection />

      {/* Plans Section */}
      <PlanSection />

      {/* CTA Banner - Engagement #1 (Gold with Shield Pattern) */}
      <CTABanner
        variant="gold"
        heading="Ficou com alguma dúvida?"
        subheading="Nosso time está pronto para te ajudar"
        ctaText="Falar com especialista"
      />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Banner - Engagement #2 (Gold with Pulse Pattern) */}
      <CTABanner
        variant="gold-care"
        heading="Pronto para ter um plano de saúde que realmente cuida de você?"
        ctaText="Quero Contratar"
      />

      {/* Latest News & Content */}
      <LatestNewsSection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Footer */}
      <Footer />

      {/* AI Chat Widget */}
      <AIChatWidget />
    </>
  )
}
