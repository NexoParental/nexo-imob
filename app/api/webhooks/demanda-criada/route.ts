import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notificarNovaDemanda } from '@/lib/notifications'
import { LABELS_TIPO_DEMANDA } from '@/lib/utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Database Webhook do Supabase — validado por segredo compartilhado configurado
  // no header customizado do webhook (Database Webhooks → HTTP Headers)
  const secret = req.headers.get('x-webhook-secret')
  if (!process.env.SUPABASE_WEBHOOK_SECRET || secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { record } = body // Supabase webhook payload

  try {
    // Busca detalhes da demanda
    const { data: demanda } = await supabase
      .from('demandas')
      .select('*, contrato:contratos(*, imovel:imoveis(logradouro, numero)), aberta_por_profile:profiles!demandas_aberta_por_fkey(name)')
      .eq('id', record.id)
      .single()

    if (!demanda) return NextResponse.json({ ok: false })

    // Busca advogados da parceria
    const { data: parceria } = await supabase
      .from('parcerias')
      .select('juridico_id')
      .eq('imobiliaria_id', record.organization_id)
      .eq('ativo', true)
      .single()

    if (!parceria) return NextResponse.json({ ok: true })

    const { data: advogados } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('organization_id', parceria.juridico_id)

    const im = (demanda.contrato as any)?.imovel
    const imovelStr = im ? `${im.logradouro}, ${im.numero}` : '—'

    for (const adv of advogados ?? []) {
      await notificarNovaDemanda({
        paraEmail: adv.email,
        paraNome: adv.name,
        protocolo: demanda.protocolo,
        tipo: LABELS_TIPO_DEMANDA[demanda.tipo as keyof typeof LABELS_TIPO_DEMANDA],
        imóvel: imovelStr,
        abertoBy: (demanda as any).aberta_por_profile?.name ?? '—',
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
