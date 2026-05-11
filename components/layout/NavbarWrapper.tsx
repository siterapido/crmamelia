'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'

const HIDDEN_NAVBAR_REGEX = /^\/(crm|admin|login)(\/|$)/
const HIDDEN_NAVBAR_EXACT = ['/']

export function NavbarWrapper() {
  const pathname = usePathname()
  const hide = HIDDEN_NAVBAR_EXACT.includes(pathname) || HIDDEN_NAVBAR_REGEX.test(pathname)
  if (hide) return null
  return <Navbar />
}
