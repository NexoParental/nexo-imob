import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  try {
    // Estatísticas gerais
    const { data: demandasPorStatus } = await supabase
      .from('demandas')
      .select('status')
      .eq('organization_id', profile.organization_id)

    const statusCounts = {
      aberta: demandasPorStatus?.filter(d => d.status === 'aberta').length || 0,
      em_analise: demandasPorStatus?.filter(d => d.status === 'em_analise').length || 0,
      aguardando_doc: demandasPorStatus?.filter(d => d.status === 'aguardando_doc').length || 0,
      protocolado: demandasPorStatus?.filter(d => d.status === 'protocolado').length || 0,
      em_andamento: demandasPorStatus?.filter(d => d.status === 'em_andamento').length || 0,
      concluida: demandasPorStatus?.filter(d => d.status === 'concluida').length || 0,
    }

    // Demandas por tipo
    const { data: demandasPorTipo } = await supabase
      .from('demandas')
      .select('tipo')
      .eq('organization_id', profile.organization_id)

    const tipoCounts = demandasPorTipo?.reduce((acc: any, d: any) => {
      acc[d.tipo] = (acc[d.tipo] || 0) + 1
      return acc
    }, {}) || {}

    // Prazos próximos (próximos 7 dias)
    const { data: demandasComPrazo } = await supabase
      .from('demandas')
      .select('id, protocolo, prazo, tipo, contrato:contratos(numero)')
      .eq('organization_id', profile.organization_id)
      .not('prazo', 'is', null)
      .lt('prazo', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .gt('prazo', new Date().toISOString())
      .order('prazo', { ascending: true })

    // Total de contratos
    const { count: totalContratos } = await supabase
      .from('contratos')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)

    // Cobranças jurídicas ativas (proxy real de inadimplência — não toda demanda "aberta")
    const { count: cobrancasAtivas } = await supabase
      .from('demandas')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)
      .eq('tipo', 'cobranca')
      .neq('status', 'concluida')

    // Tempo médio de resolução (demandas concluídas)
    const { data: demandasConcluidas } = await supabase
      .from('demandas')
      .select('created_at, updated_at')
      .eq('organization_id', profile.organization_id)
      .eq('status', 'concluida')
      .limit(50)

    const tempoMedio = demandasConcluidas?.length
      ? Math.round(
          demandasConcluidas.reduce((acc, d) => {
            const dias = (new Date(d.updated_at).getTime() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24)
            return acc + dias
          }, 0) / demandasConcluidas.length
        )
      : 0

    return NextResponse.json({
      statusCounts,
      tipoCounts,
      prazosProximos: demandasComPrazo || [],
      totalContratos,
      cobrancasAtivas: cobrancasAtivas || 0,
      tempoMedioDias: tempoMedio,
      totalDemandas: demandasPorStatus?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
