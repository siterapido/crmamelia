'use client'

import { AuthProvider } from '@/lib/auth/context'
import { LoginForm } from '@/components/auth/LoginForm'

export default function HomePage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}
