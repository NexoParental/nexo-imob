'use client'
import { useEffect, useState } from 'react'
import { Card, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Stats {
  statusCounts: Record<string, number>
  tipoCounts: Record<string, number>
  prazosProximos: any[]
  totalContratos: number
  tempoMedioDias: number
  totalDemandas: number
}

const STATUS_LABELS: Record<string, string> = {
  aberta: 'Abertas',
  em_analise: 'Em análise',
  aguardando_doc: 'Aguardando doc.',
  protocolado: 'Protocolado',
  em_andamento: 'Em andamento',
  concluida: 'Concluído',
}

const TIPO_LABELS: Record<string, string> = {
  cobranca: 'Cobrança',
  notificacao: 'Notificação',
  despejo: 'Despejo',
  contratual: 'Contratual',
  condominial: 'Condominial',
  distrato: 'Distrato',
}

const STATUS_COLORS = ['#6A6ACD','#F59E0B','#EF4444','#3B82F6','#10B981','#8B5CF6']
const PIE_COLORS = ['#6A6ACD','#F59E0B','#EF4444','#3B82F6','#10B981','#8B5CF6','#EC4899']

// Gráfico de barras simples em SVG
function BarChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const W = 400
  const H = 160
  const barW = Math.max(24, Math.floor((W - (data.length + 1) * 8) / data.length))
  const gap = (W - data.length * barW) / (data.length + 1)

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" aria-label="Gráfico de barras">
      {data.map((d, i) => {
        const bh = Math.max(4, Math.round((d.value / max) * H))
        const x = gap + i * (barW + gap)
        const y = H - bh
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={bh} fill={colors[i % colors.length]} rx="2" />
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize="9" fill="#888" className="font-sans">
              {d.label.length > 8 ? d.label.slice(0, 7) + '…' : d.label}
            </text>
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="11" fill={colors[i % colors.length]} fontWeight="bold">
                {d.value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// Gráfico de pizza em SVG
function PieChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <p className="text-ink-faint text-xs">Sem dados</p>

  const R = 70
  const cx = 80
  const cy = 80
  let startAngle = -Math.PI / 2

  const slices = data.filter(d => d.value > 0).map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI
    const x1 = cx + R * Math.cos(startAngle)
    const y1 = cy + R * Math.sin(startAngle)
    startAngle += angle
    const x2 = cx + R * Math.cos(startAngle)
    const y2 = cy + R * Math.sin(startAngle)
    const large = angle > Math.PI ? 1 : 0
    return { path: `M${cx},${cy} L${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} Z`, color: colors[i % colors.length], label: d.label, value: d.value }
  })

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg viewBox="0 0 160 160" className="w-32 h-32 shrink-0">
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="1.5" />)}
      </svg>
      <div className="flex flex-col gap-1.5 text-xs">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
            <span className="text-ink-soft">{s.label}</span>
            <span className="font-bold text-ink ml-1">{s.value}</span>
            <span className="text-ink-faint">({Math.round(s.value / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-ink-faint">Carregando estatísticas...</p>
  if (!stats) return <p className="text-urgent">Erro ao carregar dados</p>

  const statusData = Object.entries(stats.statusCounts).map(([k, v]) => ({ label: STATUS_LABELS[k] ?? k, value: v }))
  const tipoData = Object.entries(stats.tipoCounts).map(([k, v]) => ({ label: TIPO_LABELS[k] ?? k, value: v }))

  const inadimplentes = stats.statusCounts['aberta'] ?? 0
  const taxaInadimplencia = stats.totalContratos > 0 ? ((inadimplentes / stats.totalContratos) * 100).toFixed(1) : '0'
  const taxaConclusao = stats.totalDemandas > 0 ? Math.round(((stats.statusCounts.concluida ?? 0) / stats.totalDemandas) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Export */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => window.open('/api/dashboard/export?format=csv', '_blank')}>
          ↓ Exportar CSV
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.open('/api/dashboard/export?format=excel', '_blank')}>
          ↓ Exportar Excel
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.print()}>
          ↓ Imprimir PDF
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-2">Total de demandas</div>
          <div className="text-3xl font-bold text-accent">{stats.totalDemandas}</div>
        </Card>
        <Card>
          <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-2">Contratos ativos</div>
          <div className="text-3xl font-bold text-accent">{stats.totalContratos}</div>
        </Card>
        <Card>
          <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-2">Tempo médio resolução</div>
          <div className="text-3xl font-bold text-accent">{stats.tempoMedioDias}d</div>
        </Card>
        <Card>
          <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-2">Taxa de conclusão</div>
          <div className="text-3xl font-bold text-accent">{taxaConclusao}%</div>
        </Card>
      </div>

      {/* Taxa de inadimplência */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[11px] text-ink-faint uppercase tracking-wider mb-1">Taxa de inadimplência da carteira</div>
            <div className="text-4xl font-bold text-urgent">{taxaInadimplencia}%</div>
            <div className="text-xs text-ink-soft mt-1">{inadimplentes} demandas abertas sobre {stats.totalContratos} contratos</div>
          </div>
          <div className="w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eee" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={Number(taxaInadimplencia) > 20 ? '#EF4444' : '#F59E0B'}
                strokeWidth="3"
                strokeDasharray={`${taxaInadimplencia} 100`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-4">Demandas por tipo</h3>
          <PieChart data={tipoData} colors={PIE_COLORS} />
        </Card>
        <Card>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-4">Demandas por status</h3>
          <BarChart data={statusData} colors={STATUS_COLORS} />
        </Card>
      </div>

      {/* Prazos Próximos */}
      {stats.prazosProximos.length > 0 && (
        <Card>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-4">Prazos nos próximos 7 dias</h3>
          <div className="space-y-3">
            {stats.prazosProximos.map(p => (
              <div key={p.id} className="flex justify-between items-start border-b border-line pb-2 last:border-0">
                <div>
                  <span className="font-semibold text-sm">{p.protocolo}</span>
                  <span className="text-[11px] text-ink-faint block">{p.tipo}</span>
                </div>
                <span className="text-urgent font-bold text-sm">
                  {new Date(p.prazo).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
