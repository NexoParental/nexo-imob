'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui'
import Link from 'next/link'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const sb = createClient()
    await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/nova-senha`,
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-line p-6">
        <h2 className="text-lg font-bold mb-1">Recuperar senha</h2>
        <p className="text-sm text-ink-soft mb-5">Enviaremos um link de redefinição para seu e-mail.</p>
        {sent ? (
          <p className="text-sm text-success bg-success-bg p-3">
            Link enviado! Verifique sua caixa de entrada.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Button type="submit" variant="accent" loading={loading} className="w-full justify-center">Enviar link</Button>
          </form>
        )}
        <Link href="/login" className="block text-center text-xs text-ink-faint mt-4 hover:text-ink-soft">← Voltar ao login</Link>
      </div>
    </div>
  )
}
