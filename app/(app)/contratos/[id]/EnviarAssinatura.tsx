'use client'
import { useState } from 'react'
import { Button, Card } from '@/components/ui'

export default function EnviarAssinatura({ contratoId }: { contratoId: string }) {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [status, setStatus] = useState<any>(null)
  const [erro, setErro] = useState('')

  async function enviar() {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/contratos/clicksign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contrato_id: contratoId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar')
      setResultado(data)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function verificarStatus() {
    if (!resultado?.doc_key) return
    const res = await fetch(`/api/contratos/clicksign?doc_key=${resultado.doc_key}`)
    const data = await res.json()
    setStatus(data)
  }

  const STATUS_LABEL: Record<string, string> = {
    running: 'Aguardando assinaturas',
    closed: 'Concluído',
    canceled: 'Cancelado',
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">Assinatura Eletrônica</h3>
        {!resultado && (
          <Button variant="accent" size="sm" onClick={enviar} loading={loading}>
            Enviar para assinatura
          </Button>
        )}
        {resultado && (
          <Button variant="ghost" size="sm" onClick={verificarStatus}>
            Atualizar status
          </Button>
        )}
      </div>

      {erro && <p className="text-urgent text-xs">{erro}</p>}

      {!resultado && !erro && (
        <p className="text-xs text-ink-faint">
          Envia o contrato via Clicksign para proprietário, inquilino e fiador assinarem por e-mail.
        </p>
      )}

      {resultado && (
        <div className="space-y-2 text-sm">
          <p className="text-ink">
            ✓ Envelope criado. E-mails enviados para:{' '}
            <span className="font-semibold">{resultado.signatarios?.join(', ')}</span>
          </p>
          <a
            href={resultado.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent underline"
          >
            Acompanhar no Clicksign →
          </a>
        </div>
      )}

      {status && (
        <div className="mt-3 pt-3 border-t border-line space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-soft">Status</span>
            <span className="font-semibold">{STATUS_LABEL[status.status] ?? status.status}</span>
          </div>
          {status.signers?.map((s: any, i: number) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-ink-soft">{s.nome}</span>
              <span className={s.signed ? 'text-green-600 font-semibold' : 'text-ink-faint'}>
                {s.signed ? `✓ ${new Date(s.signed_at).toLocaleDateString('pt-BR')}` : 'Pendente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
