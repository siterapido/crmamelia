'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'

const HIDDEN_NAVBAR_PATHS = ['/crm', '/admin', '/login']

export function NavbarWrapper() {
  const pathname = usePathname()
  const hide = HIDDEN_NAVBAR_PATHS.some((p) => pathname.startsWith(p))
  if (hide) return null
  return <Navbar />
}
