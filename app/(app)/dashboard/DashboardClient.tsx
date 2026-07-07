'use client'
import { useState } from 'react'
import { cn, isPrazoProximo, LABELS_TIPO_DEMANDA } from '@/lib/utils'
import CartaoDemanda from '@/components/demandas/CartaoDemanda'
import type { Demanda, TipoDemanda } from '@/lib/types'

const TIPOS: { value: TipoDemanda | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'cobranca', label: 'Cobrança' },
  { value: 'despejo', label: 'Despejo' },
  { value: 'notificacao', label: 'Notificação' },
  { value: 'contratual', label: 'Contratual' },
  { value: 'condominial', label: 'Condominial' },
  { value: 'distrato', label: 'Distrato' },
]

type StatKey = 'ativas' | 'vencem' | 'aguardando' | 'concluidas' | null

interface Props {
  demandas: Demanda[]
  counts: { ativas: number; vencem: number; aguardando: number; concluidas: number }
  isAdvogado: boolean
  initialTipo?: string
  initialStat?: string
}

export default function DashboardClient({ demandas, counts, isAdvogado, initialTipo, initialStat }: Props) {
  const [tipo, setTipo] = useState<TipoDemanda | 'todas'>((initialTipo as TipoDemanda) ?? 'todas')
  const [stat, setStat] = useState<StatKey>((initialStat as StatKey) ?? null)

  function handleStat(key: StatKey) {
    setStat(prev => prev === key ? null : key)
    setTipo('todas')
  }
  function handleTipo(t: TipoDemanda | 'todas') {
    setTipo(t)
    setStat(null)
  }

  const filtered = demandas.filter(d => {
    if (stat === 'ativas') return d.status !== 'concluida'
    if (stat === 'vencem') return isPrazoProximo(d.prazo ?? undefined)
    if (stat === 'aguardando') return d.status === 'aguardando_doc'
    if (stat === 'concluidas') return d.status === 'concluida'
    if (tipo !== 'todas') return d.tipo === tipo
    return true
  })

  const stats = isAdvogado
    ? [
        { key: 'vencem' as StatKey,    label: 'Vencem em 5 dias',          value: counts.vencem,    accent: true },
        { key: 'ativas' as StatKey,    label: 'Sob sua responsabilidade',  value: counts.ativas,    accent: false },
        { key: 'aguardando' as StatKey,label: 'Aguardando Haroldo Lopes',  value: counts.aguardando,accent: false },
      ]
    : [
        { key: 'ativas' as StatKey,    label: 'Demandas ativas',           value: counts.ativas,    accent: false },
        { key: 'vencem' as StatKey,    label: 'Prazo em 5 dias',           value: counts.vencem,    accent: true },
        { key: 'aguardando' as StatKey,label: 'Aguardando você',           value: counts.aguardando,accent: false },
        { key: 'concluidas' as StatKey,label: 'Concluídas em 2026',        value: counts.concluidas,accent: false },
      ]

  return (
    <>
      {/* Stat cards */}
      <div className={cn('grid gap-3 mb-3', isAdvogado ? 'grid-cols-3' : 'grid-cols-4')}>
        {stats.map(s => (
          <button
            key={s.key}
            onClick={() => handleStat(s.key)}
            className={cn(
              'bg-surface border p-4 text-left transition-all',
              stat === s.key ? 'border-accent ring-1 ring-accent' : 'border-line hover:border-ink-faint'
            )}
          >
            <div className={cn('font-bold tracking-tight leading-none text-3xl', s.accent ? 'text-urgent' : 'text-ink')}>
              {s.value}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-ink-soft mt-1.5">{s.label}</div>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-ink-faint mb-4">Clique em um número para filtrar — clique de novo para limpar.</p>

      {/* Filtros por tipo */}
      {!isAdvogado && (
        <div className="flex flex-wrap gap-2 mb-4">
          {TIPOS.map(t => (
            <button
              key={t.value}
              onClick={() => handleTipo(t.value)}
              className={cn(
                'text-[12.5px] px-3 py-1.5 border font-medium transition-colors',
                tipo === t.value && !stat
                  ? 'bg-ink text-surface border-ink'
                  : 'bg-surface text-ink-soft border-line hover:border-ink-faint'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Legenda de status */}
      <div className="flex flex-wrap gap-3 mb-4 text-[11.5px] text-ink-soft">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning inline-block" />Em análise</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />Aguardando doc.</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Protocolado</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success inline-block" />Em andamento</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink-faint inline-block" />Concluído</span>
      </div>

      {/* Tabela */}
      <div className="bg-surface border border-line overflow-hidden">
        <div
          className="grid px-4 py-2 bg-surface-alt text-[10.5px] uppercase tracking-widest text-ink-faint font-semibold"
          style={{ gridTemplateColumns: '110px 1fr 90px 130px 90px' }}
        >
          <div>Protocolo</div><div>Caso</div><div>Urgência</div><div>Status</div><div>Prazo</div>
        </div>
        {filtered.length === 0
          ? <p className="text-sm text-ink-faint text-center py-10">Nenhuma demanda nesta situação.</p>
          : filtered.map(d => <CartaoDemanda key={d.id} demanda={d} />)
        }
      </div>
    </>
  )
}
