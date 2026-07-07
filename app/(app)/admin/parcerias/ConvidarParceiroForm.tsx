'use client'
import { useState } from 'react'
import { Button, Input, Card, FieldNote } from '@/components/ui'

export default function ConvidarParceiroForm({ orgType }: { orgType: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const labelParceiro = orgType === 'imobiliaria' ? 'escritório jurídico parceiro' : 'imobiliária parceira'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/admin/convidar-parceiro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ para_email: email }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false) }
    else {
      setSuccess(`Convite enviado para ${email}. Quando aceito, a parceria é ativada automaticamente.`)
      setEmail('')
      setLoading(false)
    }
  }

  return (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Convidar {labelParceiro}</h2>
      <Card className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <Input
              label={`E-mail do administrador do ${labelParceiro}`}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@escritorio.com.br"
            />
            <FieldNote>
              O parceiro receberá um e-mail com um link para aceitar. Ao aceitar, a conexão é ativada e os dados ficam visíveis para ambos.
            </FieldNote>
          </div>
          {success && <p className="text-xs text-success bg-success-bg p-2.5">{success}</p>}
          {error && <p className="text-xs text-urgent">{error}</p>}
          <Button type="submit" variant="accent" loading={loading}>
            Enviar convite
          </Button>
        </form>
      </Card>
    </section>
  )
}
