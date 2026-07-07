'use client'
import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Input } from '@/components/ui'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const sb = createClient()
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
    } else {
      router.push(next)
    }
  }

  return (
    <form onSubmit={handleLogin} className="w-full max-w-sm bg-surface border border-line p-6 flex flex-col gap-4">
      <Input
        label="E-mail"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        autoFocus
      />
      <Input
        label="Senha"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      {error && <p className="text-xs text-urgent">{error}</p>}
      <Button type="submit" variant="accent" loading={loading} className="w-full justify-center">
        Entrar
      </Button>
      <a href="/recuperar-senha" className="text-center text-xs text-ink-faint hover:text-ink-soft">
        Esqueceu a senha?
      </a>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center text-accent font-bold text-xl mx-auto mb-4">N</div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Nexo Imob</h1>
        <p className="text-sm text-ink-soft mt-1">Plataforma imobiliária × jurídico</p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
