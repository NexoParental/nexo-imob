'use client'
import { useState } from 'react'
import { Button, Card } from '@/components/ui'

export default function AnalisarContrato({ contratoId }: { contratoId: string }) {
  const [loading, setLoading] = useState(false)
  const [analise, setAnalise] = useState<any>(null)
  const [erro, setErro] = useState('')

  async function analisar() {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/contratos/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contrato_id: contratoId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar')
      setAnalise(data.analise)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint">Análise com IA</h3>
        <Button variant="accent" size="sm" onClick={analisar} loading={loading}>
          {analise ? 'Reanalisar' : 'Analisar com IA'}
        </Button>
      </div>

      {erro && <p className="text-urgent text-xs">{erro}</p>}

      {analise && (
        <div className="space-y-3 text-sm">
          {analise.resumo_geral && (
            <p className="text-ink leading-relaxed">{analise.resumo_geral}</p>
          )}
          {analise.partes && (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft block mb-1">Partes</span>
              <p className="text-ink">{analise.partes}</p>
            </div>
          )}
          {analise.valores && (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft block mb-1">Valores</span>
              <p className="text-ink">{analise.valores}</p>
            </div>
          )}
          {analise.prazos && (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft block mb-1">Prazos</span>
              <p className="text-ink">{analise.prazos}</p>
            </div>
          )}
          {analise.tipo_garantia && (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft block mb-1">Garantia</span>
              <p className="text-ink">{analise.tipo_garantia}</p>
            </div>
          )}
          {Array.isArray(analise.clausulas_risco) && analise.clausulas_risco.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-urgent block mb-1">Pontos de Atenção</span>
              <ul className="space-y-1">
                {analise.clausulas_risco.map((c: string, i: number) => (
                  <li key={i} className="text-ink flex gap-2">
                    <span className="text-urgent mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!analise && !loading && (
        <p className="text-xs text-ink-faint">Clique para que a IA leia os dados do contrato e retorne partes, valores, prazos e cláusulas de risco.</p>
      )}
    </Card>
  )
}
