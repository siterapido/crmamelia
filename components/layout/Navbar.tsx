'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  label: string
  href: string
  highlight?: boolean
}

const navItems: NavItem[] = [
  { label: 'Nossos Planos', href: '/#plans', highlight: true },
  { label: 'Sobre Nós', href: '/sobre' },
  { label: 'Blog', href: '/noticias' },
  { label: 'Canais de Atendimento', href: '/#faq' },
]

/**
 * Premium Navbar Component - SIX Saúde Design System
 */
export const Navbar = () => {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')
  const isGoldHero = pathname === '/lp-2'
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  if (isAdminRoute) return null

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-300 ease-premium',
          isScrolled
            ? 'bg-gold-primary/95 backdrop-blur-xl shadow-premium'
            : 'bg-transparent'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Container>
          <nav className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative w-32 h-10 md:w-40 md:h-12"
              >
                <Image
                    src={
                      isScrolled
                        ? '/Logos/SIX SAÚDE LOGO FINAL - Preta .png'
                        : isGoldHero
                          ? '/Logos/SIX SAÚDE LOGO FINAL - Preta .png'
                          : '/Logos/SIX SAÚDE LOGO FINAL - Amarela.png'
                    }
                  alt="SIX Saúde"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                item.highlight ? (
                  <Button
                    key={item.href}
                    variant="primary"
                    size="sm"
                    className={cn(
                      'uppercase tracking-wider font-bold',
                      (isScrolled || isGoldHero && !isScrolled)
                        ? '!bg-black-premium !bg-none !text-white hover:!bg-black-premium/90 shadow-md'
                        : '!bg-gold-primary !bg-none !text-black-premium hover:!bg-gold-signature shadow-gold-sm'
                    )}
                    onClick={() => {
                      if (item.href.startsWith('/#')) {
                        const element = document.querySelector(item.href.substring(1))
                        element?.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'transition-colors duration-300',
                      'text-sm font-bold tracking-wider uppercase',
                      isScrolled
                        ? '!text-black-premium hover:!text-black-premium/70'
                        : isGoldHero
                          ? '!text-[#0A0A0A] hover:!text-[#0A0A0A]/70'
                          : 'text-black-premium/80 hover:text-black-premium',
                      'relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5',
                      (isScrolled || isGoldHero && !isScrolled) ? 'after:bg-black-premium' : 'after:bg-gold-signature',
                      'after:transition-all after:duration-300',
                      'hover:after:w-full'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative z-50 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className={cn("w-6 h-6", isMobileMenuOpen ? "text-white" : "text-black-premium")} />

            </button>
          </nav>
        </Container>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black-premium/98 backdrop-blur-2xl" />
            <motion.nav
              className="relative h-full flex flex-col items-center justify-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-2xl font-display text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nossos Planos
              </Button>
            </motion.nav>
            <button
              className="absolute top-8 right-6 text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
