'use client'
import { useState } from 'react'
import { Button, Input, Select, FieldNote, Card } from '@/components/ui'

interface Props { organizationId: string }

export default function ConvidarUsuarioForm({ organizationId }: Props) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('administrativo')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/admin/convidar-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, role, organization_id: organizationId }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false) }
    else { setSuccess(`Convite enviado para ${email}`); setNome(''); setEmail(''); setLoading(false) }
  }

  return (
    <Card>
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-4">Convidar usuário</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input label="Nome completo" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex.: Ana Souza" />
        <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ana@harloldolopes.com.br" />
        <div>
          <Select label="Papel" value={role} onChange={e => setRole(e.target.value)} options={[{value:'gestor',label:'Gestor'},{value:'administrativo',label:'Administrativo'},{value:'corretor',label:'Corretor'}]} />
          <FieldNote>Define o que o usuário consegue ver e fazer na plataforma.</FieldNote>
        </div>
        {success && <p className="text-xs text-success bg-success-bg p-2">{success}</p>}
        {error && <p className="text-xs text-urgent">{error}</p>}
        <Button type="submit" variant="accent" loading={loading}>Enviar convite</Button>
      </form>
    </Card>
  )
}
