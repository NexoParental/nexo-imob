import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CartaoDemanda from '@/components/demandas/CartaoDemanda'
import DashboardClient from './DashboardClient'
import DashboardStats from './DashboardStats'
import type { Demanda } from '@/lib/types'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; stat?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Busca demandas com todos os joins
  const { data: demandas } = await supabase
    .from('demandas')
    .select(`
      *,
      contrato:contratos(
        *,
        imovel:imoveis(*),
        proprietario:pessoas!contratos_proprietario_id_fkey(*),
        inquilino:pessoas!contratos_inquilino_id_fkey(*),
        fiador:pessoas!contratos_fiador_id_fkey(*)
      )
    `)
    .order('created_at', { ascending: false })

  const all = (demandas ?? []) as Demanda[]

  // Contagens para os stat cards
  const ativas = all.filter(d => d.status !== 'concluida').length
  const vencem = all.filter(d => {
    if (!d.prazo) return false
    const diff = new Date(d.prazo).getTime() - Date.now()
    return diff > 0 && diff < 5 * 24 * 60 * 60 * 1000
  }).length
  const aguardando = all.filter(d => d.status === 'aguardando_doc').length
  const concluidas = all.filter(d => d.status === 'concluida').length

  const isAdvogado = profile.role === 'advogado'
  const isCorretor = profile.role === 'corretor'

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">
            {isAdvogado ? profile.organization?.name : 'Painel geral'}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAdvogado ? 'Fila de demandas' : isCorretor ? 'Meus imóveis' : 'Demandas com o jurídico'}
          </h1>
        </div>
        {!isAdvogado && !isCorretor && (
          <Link href="/demandas/nova" className="bg-accent text-white text-sm font-semibold px-4 py-2.5 hover:bg-accent-deep transition-colors">
            + Abrir nova demanda
          </Link>
        )}
      </div>

      <DashboardClient
        demandas={all}
        counts={{ ativas, vencem, aguardando, concluidas }}
        isAdvogado={isAdvogado}
        initialTipo={params.tipo}
        initialStat={params.stat}
      />

      {/* Dashboard com estatísticas completas */}
      <div className="mt-8 pt-8 border-t border-line">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-5">Estatísticas</h2>
        <DashboardStats />
      </div>
    </div>
  )
}
