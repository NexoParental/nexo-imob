import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarioClient from './CalendarioClient'
import type { Demanda } from '@/lib/types'

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: demandas } = await supabase
    .from('demandas')
    .select(`
      id, protocolo, tipo, status, urgencia, prazo,
      contrato:contratos(numero, imovel:imoveis(logradouro, numero, bairro), inquilino:pessoas!contratos_inquilino_id_fkey(nome))
    `)
    .not('prazo', 'is', null)
    .neq('status', 'concluida')
    .order('prazo', { ascending: true })

  return (
    <div>
      <div className="mb-5 pb-4 border-b border-line">
        <h1 className="text-2xl font-bold tracking-tight">Calendário de Prazos</h1>
        <p className="text-sm text-ink-soft mt-1">Todas as demandas com prazo definido, em visão mensal.</p>
      </div>
      <CalendarioClient demandas={(demandas ?? []) as any} />
    </div>
  )
}
