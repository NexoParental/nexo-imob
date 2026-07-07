'use client'
import { useState } from 'react'
import { Card, Button } from '@/components/ui'

export default function ConsultarCNJ({
  demandaId,
  numeroInicial,
}: {
  demandaId: string
  numeroInicial?: string | null
}) {
  const [numero, setNumero] = useState(numeroInicial || '')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

  async function consultar() {
    if (!numero.trim()) return
    setLoading(true)
    setErro('')
    setResultado(null)
    try {
      const res = await fetch('/api/integracao/cnj/sincronizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_processo: numero, demanda_id: demandaId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao consultar')
      setResultado(data.dados)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Processo CNJ (DataJud)</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={numero}
          onChange={e => setNumero(e.target.value)}
          placeholder="0000000-00.0000.0.00.0000"
          className="flex-1 px-3 py-2 text-sm bg-paper border border-line text-ink focus:outline-none focus:border-accent font-mono min-w-0"
          onKeyDown={e => e.key === 'Enter' && consultar()}
        />
        <Button variant="accent" size="sm" onClick={consultar} loading={loading}>
          Buscar
        </Button>
      </div>

      {erro && <p className="text-urgent text-xs mt-2">{erro}</p>}

      {resultado && (
        <div className="mt-3 pt-3 border-t border-line space-y-2 text-sm">
          {resultado.classe && (
            <div className="flex justify-between">
              <span className="text-ink-soft">Classe</span>
              <span className="font-semibold text-right max-w-[160px]">{resultado.classe}</span>
            </div>
          )}
          {resultado.orgaoJulgador && (
            <div className="flex justify-between">
              <span className="text-ink-soft">Órgão</span>
              <span className="font-semibold text-right max-w-[160px] text-xs">{resultado.orgaoJulgador}</span>
            </div>
          )}
          {resultado.dataAjuizamento && (
            <div className="flex justify-between">
              <span className="text-ink-soft">Ajuizamento</span>
              <span className="font-mono text-xs">{new Date(resultado.dataAjuizamento).toLocaleDateString('pt-BR')}</span>
            </div>
          )}

          {resultado.movimentos?.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] text-ink-faint uppercase tracking-wider block mb-2">Últimas movimentações</span>
              <div className="space-y-1.5">
                {resultado.movimentos.map((m: any, i: number) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="text-ink-faint font-mono shrink-0">
                      {new Date(m.data).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-ink">{m.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-ink-faint pt-1">
            Sincronizado em {new Date(resultado.updated_at).toLocaleString('pt-BR')}
          </p>
        </div>
      )}
    </Card>
  )
}
