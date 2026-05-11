import type { Metadata, Viewport } from 'next'
import { fontVariables, inter, syne } from '@/lib/fonts'
import { NavbarWrapper } from '@/components/layout/NavbarWrapper'
import { CursorGlow } from '@/components/effects/CursorGlow'
import '@/styles/globals.css'

/**
 * Viewport Configuration
 * Ensures proper rendering on all devices
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark',
  themeColor: '#0A0A0A',
}

/**
 * SEO & Metadata Configuration
 * Optimized for search engines and social media
 */
export const metadata: Metadata = {
  title: 'Amélia Saúde | Administradora de Benefícios Premium',
  description:
    'Planos de saúde com transparência, agilidade e atendimento humano. Administradora AAA registrada na ANS com 10+ anos de experiência.',
  applicationName: 'Amélia Saúde',
  authors: [{ name: 'Amélia Saúde' }],
  keywords: [
    'plano de saúde',
    'administradora de benefícios',
    'saúde',
    'benefícios',
    'cobertura médica',
    'atendimento 24/7',
    'ANS registrada',
  ],
  category: 'Healthcare',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',

  /* Open Graph - Social Media */
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://ameliasaude.com.br',
    siteName: 'Amélia Saúde',
    title: 'Amélia Saúde | Administradora de Benefícios Premium',
    description:
      'Planos de saúde com transparência, agilidade e atendimento humano. Administradora AAA registrada na ANS.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Amélia Saúde - Administradora de Benefícios',
        type: 'image/jpeg',
      },
    ],
  },

  /* Twitter Card */
  twitter: {
    card: 'summary_large_image',
    title: 'Amélia Saúde | Administradora de Benefícios Premium',
    description:
      'Planos de saúde com transparência, agilidade e atendimento humano.',
    images: ['/og-image.jpg'],
  },

  /* Other Metadata */
  metadataBase: new URL('https://ameliasaude.com.br'),
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Amélia Saúde',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
}

/**
 * Root Layout Component
 * Main layout wrapper for all pages with fonts and global styles
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Additional Meta Tags for Performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />

        {/* DNS Prefetch for Performance */}
        <link rel="dns-prefetch" href="https://cdn.example.com" />

        {/* Security Headers */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />

        {/* Schema.org JSON-LD - LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              '@id': 'https://ameliasaude.com.br',
              name: 'Amélia Saúde',
              description: 'Administradora de Benefícios de Saúde Premium. Planos de saúde com transparência, agilidade e atendimento humano.',
              url: 'https://ameliasaude.com.br',
              logo: 'https://ameliasaude.com.br/logo.png',
              image: 'https://ameliasaude.com.br/og-image.jpg',
              telephone: '+55-21-97222-9609',
              email: 'atendimento@ameliasaude.com.br',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'São Paulo',
                addressRegion: 'SP',
                addressCountry: 'BR',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: -23.5505,
                longitude: -46.6333,
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '00:00',
                closes: '23:59',
              },
              sameAs: [
                'https://instagram.com/ameliasaude',
                'https://linkedin.com/company/ameliasaude',
                'https://facebook.com/ameliasaude',
              ],
              priceRange: '$$',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '500',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} ${syne.className} antialiased bg-black-premium text-white`}
      >
        {/* Skip to main content for accessibility */}
        <a href="#main" className="sr-only focus:not-sr-only">
          Pular para conteúdo principal
        </a>

        {/* Cursor Glow Effect */}
        <CursorGlow />

        {/* Navigation */}
        <NavbarWrapper />

        {/* Main Content */}
        <main id="main" className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
