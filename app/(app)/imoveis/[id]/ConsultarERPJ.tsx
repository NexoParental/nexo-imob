'use client'
import { useState } from 'react'
import { Card, Button } from '@/components/ui'

export default function ConsultarERPJ({
  imovelId,
  matriculaInicial,
  cartorioInicial,
}: {
  imovelId: string
  matriculaInicial?: string | null
  cartorioInicial?: string | null
}) {
  const [matricula, setMatricula] = useState(matriculaInicial || '')
  const [cartorio, setCartorio] = useState(cartorioInicial || '')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

  async function consultar() {
    if (!matricula.trim() || !cartorio.trim()) {
      setErro('Preencha matrícula e cartório')
      return
    }
    setLoading(true)
    setErro('')
    setResultado(null)
    try {
      const res = await fetch('/api/integracao/erp/consultar-matricula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imovel_id: imovelId, numero_matricula: matricula, cartorio }),
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
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Consulta eRPJ</h3>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={matricula}
          onChange={e => setMatricula(e.target.value)}
          placeholder="Número da matrícula"
          className="w-full px-3 py-2 text-sm bg-paper border border-line text-ink focus:outline-none focus:border-accent font-mono"
        />
        <input
          type="text"
          value={cartorio}
          onChange={e => setCartorio(e.target.value)}
          placeholder="Cartório de registro (ex: 1º CRI São Paulo)"
          className="w-full px-3 py-2 text-sm bg-paper border border-line text-ink focus:outline-none focus:border-accent"
        />
        <Button variant="accent" size="sm" onClick={consultar} loading={loading} className="self-end">
          Consultar eRPJ
        </Button>
      </div>

      {erro && <p className="text-urgent text-xs mt-2">{erro}</p>}

      {resultado && (
        <div className="mt-3 pt-3 border-t border-line space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Proprietário</span>
            <span className="font-semibold text-right">{resultado.proprietario}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-soft">Ônus / Hipotecas</span>
            {resultado.onusHipotecas?.temOnus ? (
              <span className="text-urgent font-bold text-xs px-2 py-0.5 bg-urgent/10 rounded">⚠ Ônus detectados</span>
            ) : (
              <span className="text-success font-semibold text-xs">Sem ônus</span>
            )}
          </div>
          {resultado.onusHipotecas?.descricao && (
            <p className="text-xs text-ink-faint">{resultado.onusHipotecas.descricao}</p>
          )}
          <div className="flex justify-between">
            <span className="text-ink-soft">Consultado em</span>
            <span className="font-mono text-xs">{new Date(resultado.dataConsulta).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
