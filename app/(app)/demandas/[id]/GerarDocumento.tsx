'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Select } from '@/components/ui'

interface Props {
  demandaId: string
}

export default function GerarDocumento({ demandaId }: Props) {
  const [tipo, setTipo] = useState<string>('notificacao_extrajudicial')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function gerar() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/documentos/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, demanda_id: demandaId }),
    })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    // Mostrar documento gerado
    const blob = new Blob([data.documento.conteudo], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.documento.titulo}.txt`
    a.click()

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-surface border border-line p-5 mt-5">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-4">Gerar documento</h3>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Select
            label="Tipo de documento"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            options={[
              { value: 'notificacao_extrajudicial', label: 'Notificação extrajudicial' },
              { value: 'carta_cobranca', label: 'Carta de cobrança' },
              { value: 'aviso_despejo', label: 'Aviso de despejo' },
              { value: 'distrato', label: 'Distrato de contrato' },
            ]}
          />
        </div>
        <Button onClick={gerar} loading={loading} variant="accent">
          Gerar
        </Button>
      </div>
      {error && <p className="text-xs text-urgent mt-2">{error}</p>}
    </div>
  )
}
