'use client'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LABELS_TIPO_DEMANDA } from '@/lib/utils'
import type { TipoDemanda, UrgenciaDemanda } from '@/lib/types'

const URGENCIA_COLOR: Record<UrgenciaDemanda, string> = {
  alta: 'bg-urgent text-white',
  media: 'bg-amber-500 text-white',
  baixa: 'bg-accent text-white',
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

interface DemandaCalendario {
  id: string
  protocolo: string
  tipo: TipoDemanda
  urgencia: UrgenciaDemanda
  prazo: string
  contrato?: { numero: string; imovel?: { logradouro: string; numero: string }; inquilino?: { nome: string } }
}

export default function CalendarioClient({ demandas }: { demandas: DemandaCalendario[] }) {
  const today = new Date()
  const [ano, setAno] = useState(today.getFullYear())
  const [mes, setMes] = useState(today.getMonth())

  function navegar(delta: number) {
    let nm = mes + delta
    let na = ano
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMes(nm)
    setAno(na)
  }

  // Construir grid do mês
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const ultimoDia = new Date(ano, mes + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(primeiroDia).fill(null), ...Array.from({ length: ultimoDia }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  // Indexar demandas por dia
  const porDia: Record<number, DemandaCalendario[]> = {}
  for (const d of demandas) {
    const dt = new Date(d.prazo + 'T12:00:00')
    if (dt.getFullYear() === ano && dt.getMonth() === mes) {
      const dia = dt.getDate()
      if (!porDia[dia]) porDia[dia] = []
      porDia[dia].push(d)
    }
  }

  const todayDia = today.getMonth() === mes && today.getFullYear() === ano ? today.getDate() : null

  // Lista de demandas com prazo no mês visualizado
  const demandasMes = demandas.filter(d => {
    const dt = new Date(d.prazo + 'T12:00:00')
    return dt.getFullYear() === ano && dt.getMonth() === mes
  })

  return (
    <div className="space-y-5">
      {/* Navegação */}
      <div className="flex items-center gap-3">
        <button onClick={() => navegar(-1)} className="border border-line px-3 py-1.5 text-sm hover:border-ink-faint">←</button>
        <span className="text-lg font-semibold min-w-[180px] text-center">{MESES[mes]} {ano}</span>
        <button onClick={() => navegar(1)} className="border border-line px-3 py-1.5 text-sm hover:border-ink-faint">→</button>
        <button
          onClick={() => { setMes(today.getMonth()); setAno(today.getFullYear()) }}
          className="ml-auto text-xs border border-line px-3 py-1.5 hover:border-ink-faint"
        >
          Hoje
        </button>
      </div>

      {/* Grade */}
      <div className="border border-line overflow-hidden">
        {/* Cabeçalho dias da semana */}
        <div className="grid grid-cols-7 border-b border-line">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-ink-faint py-2 border-r border-line last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        {/* Semanas */}
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <div key={row} className="grid grid-cols-7 border-b border-line last:border-b-0">
            {cells.slice(row * 7, row * 7 + 7).map((dia, col) => {
              const eventos = dia ? (porDia[dia] ?? []) : []
              const isToday = dia === todayDia
              const isPast = dia !== null && new Date(ano, mes, dia) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
              return (
                <div
                  key={col}
                  className={cn(
                    'min-h-[80px] p-1.5 border-r border-line last:border-r-0 align-top',
                    !dia && 'bg-paper',
                    isPast && dia && 'opacity-60',
                  )}
                >
                  {dia && (
                    <>
                      <span className={cn(
                        'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1',
                        isToday && 'bg-accent text-white',
                        !isToday && 'text-ink-soft',
                      )}>{dia}</span>
                      <div className="space-y-0.5">
                        {eventos.slice(0, 3).map(e => (
                          <Link key={e.id} href={`/demandas/${e.id}`}>
                            <span className={cn('block truncate text-[10px] px-1 py-0.5 leading-tight', URGENCIA_COLOR[e.urgencia])}>
                              {e.contrato?.imovel?.logradouro ?? LABELS_TIPO_DEMANDA[e.tipo]}
                            </span>
                          </Link>
                        ))}
                        {eventos.length > 3 && (
                          <span className="text-[10px] text-ink-faint">+{eventos.length - 3} mais</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Lista do mês */}
      {demandasMes.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">
            Prazos em {MESES[mes]} ({demandasMes.length})
          </h2>
          <div className="space-y-2">
            {demandasMes.map(d => (
              <Link key={d.id} href={`/demandas/${d.id}`} className="flex items-center gap-3 border border-line p-3 hover:border-ink-faint transition-colors">
                <div className={cn('text-center min-w-[40px] py-1 px-2 text-xs font-bold', URGENCIA_COLOR[d.urgencia])}>
                  {new Date(d.prazo + 'T12:00:00').getDate().toString().padStart(2,'0')}/{(mes+1).toString().padStart(2,'0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{LABELS_TIPO_DEMANDA[d.tipo]}</div>
                  <div className="text-xs text-ink-soft truncate">
                    {d.contrato?.imovel ? `${d.contrato.imovel.logradouro}, ${d.contrato.imovel.numero}` : '—'}
                    {d.contrato?.inquilino ? ` · ${d.contrato.inquilino.nome}` : ''}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-ink-faint">{d.protocolo}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {demandasMes.length === 0 && (
        <p className="text-sm text-ink-faint text-center py-8">Nenhum prazo registrado em {MESES[mes]} {ano}.</p>
      )}
    </div>
  )
}
