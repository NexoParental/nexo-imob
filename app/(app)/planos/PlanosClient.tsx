'use client'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

const PLANOS = [
  {
    id: 'starter',
    nome: 'Starter',
    preco: 'R$ 297',
    periodo: '/mês',
    descricao: 'Ideal para imobiliárias pequenas',
    recursos: [
      'Até 50 contratos ativos',
      '2 usuários incluídos',
      'Demandas jurídicas ilimitadas',
      'Análise de contratos com IA',
      'Gerador de peças jurídicas',
      'Exportação CSV',
    ],
  },
  {
    id: 'professional',
    nome: 'Professional',
    preco: 'R$ 697',
    periodo: '/mês',
    destaque: true,
    descricao: 'Para imobiliárias em crescimento',
    recursos: [
      'Contratos ilimitados',
      '5 usuários incluídos',
      'Tudo do Starter',
      'Assinatura eletrônica Clicksign',
      'Acompanhamento CNJ automático',
      'Exportação Excel e PDF',
      'Calendário de prazos',
      'Dashboard com KPIs e gráficos',
    ],
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    preco: 'R$ 1.497',
    periodo: '/mês',
    descricao: 'Para operações de grande porte',
    recursos: [
      'Tudo do Professional',
      'Usuários ilimitados',
      'Multi-escritório (parcerias)',
      'SLA de suporte prioritário',
      'Onboarding dedicado',
      'API de integração',
    ],
  },
]

export default function PlanosClient({ organizationId, planoAtual }: { organizationId: string; planoAtual: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  async function assinar(planoId: string) {
    setLoading(planoId)
    setErro('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: planoId, organization_id: organizationId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar sessão')
      window.location.href = data.url
    } catch (e: any) {
      setErro(e.message)
      setLoading(null)
    }
  }

  return (
    <div>
      {erro && <p className="text-urgent text-sm mb-4 p-3 border border-urgent/30 bg-urgent/5">{erro}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANOS.map(p => {
          const ativo = planoAtual === p.id
          return (
            <div
              key={p.id}
              className={cn(
                'border p-6 flex flex-col gap-4',
                p.destaque ? 'border-accent shadow-sm' : 'border-line',
                ativo && 'bg-surface-alt',
              )}
            >
              {p.destaque && (
                <div className="text-[10px] font-bold uppercase tracking-widest text-accent">Mais popular</div>
              )}
              <div>
                <h2 className="text-xl font-bold">{p.nome}</h2>
                <p className="text-ink-soft text-sm mt-0.5">{p.descricao}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{p.preco}</span>
                <span className="text-sm text-ink-soft">{p.periodo}</span>
              </div>
              <ul className="space-y-2 flex-1">
                {p.recursos.map(r => (
                  <li key={r} className="flex items-start gap-2 text-sm">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {ativo ? (
                <div className="text-center py-2 text-sm font-semibold text-accent border border-accent">
                  Plano atual
                </div>
              ) : (
                <Button
                  variant={p.destaque ? 'accent' : 'primary'}
                  onClick={() => assinar(p.id)}
                  loading={loading === p.id}
                >
                  Assinar {p.nome}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-ink-faint text-center mt-6">
        Pagamento seguro via Stripe · Cancele quando quiser · Sem fidelidade
      </p>
    </div>
  )
}
