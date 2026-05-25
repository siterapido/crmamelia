import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import { HeroSection } from '@/components/sections/HeroSection'
import { ClientSection } from '@/components/sections/ClientSection'
import { PlanSection } from '@/components/sections/PlanSection'
import { SocialProofSection } from '@/components/sections/SocialProofSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { LatestNewsSection } from '@/components/sections/LatestNewsSection'
import { Footer } from '@/components/layout/Footer'
import { AIChatWidget } from '@/components/ui/AIChatWidget'

export const metadata: Metadata = {
  title: 'Amélia Saúde | Planos de Saúde Premium com Atendimento Humano',
  description:
    'Planos de saúde com transparência, agilidade e atendimento 24/7. Operadora registrada na ANS. Autoatendimento rápido e suporte especializado.',
  openGraph: {
    title: 'Amélia Saúde | Planos de Saúde Premium',
    description: 'Planos de saúde com atendimento humano e transparência total',
    url: 'https://ameliasaude.com.br',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ClientSection />
      <PlanSection />
      <CTABanner
        variant="gold"
        heading="Ficou com alguma dúvida?"
        subheading="Nosso time está pronto para te ajudar"
        ctaText="Falar com especialista"
      />
      <FAQSection />
      <CTABanner
        variant="gold-care"
        heading="Pronto para ter um plano de saúde que realmente cuida de você?"
        ctaText="Quero Contratar"
      />
      <LatestNewsSection />
      <SocialProofSection />
      <Footer />
      <AIChatWidget />
    </>
  )
}
