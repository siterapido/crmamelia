'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { getDefaultRedirect } from '@/lib/auth/rbac'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await login(email, password)

            if (result.success && result.user) {
                const params = new URLSearchParams(window.location.search)
                const redirect = params.get('redirect')
                router.push(redirect || getDefaultRedirect(result.user.role))
            } else {
                setError(result.error || 'Erro ao fazer login')
            }
        } catch {
            setError('Erro de conexão')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black-deep flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[28rem]"
            >
                <div className="text-center mb-8">
                    <div className="relative w-40 h-12 mx-auto mb-4">
                        <Image
                            src="/Logos/SIX SAÚDE LOGO FINAL - Branca.png"
                            alt="SIX Saúde"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Área Restrita</h1>
                    <p className="text-platinum mt-2">Faça login para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-charcoal rounded-2xl p-6 space-y-5 border border-white/10">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-platinum mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-platinum mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-12 py-3 bg-black-deep border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-platinum hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gold-primary text-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-center text-platinum/50 text-sm mt-6">
                    © {new Date().getFullYear()} SIX Saúde. Todos os direitos reservados.
                </p>
            </motion.div>
        </div>
    )
}
