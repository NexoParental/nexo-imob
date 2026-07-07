import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Função para consultar eRPJ (simulada - usar API real quando disponível)
async function consultarERPJ(numeroMatricula: string, cartorio: string) {
  try {
    // TODO: Substituir por chamada real à API eRPJ quando disponível
    // const response = await fetch(`https://api.erp.cnj.jus.br/matriculas/${numeroMatricula}`, {
    //   headers: { 'Authorization': `Bearer ${ERPI_API_TOKEN}` }
    // })
    // const dados = await response.json()

    // Simulação de resposta
    const dados = {
      numeroMatricula,
      cartorio,
      proprietario: 'A CONFIRMAR NA MATRÍCULA',
      areaMagna: 0,
      onusHipotecas: {
        temOnus: false,
        descricao: 'Sem ônus registrados',
      },
      dataConsulta: new Date().toISOString(),
    }

    return dados
  } catch (error) {
    console.error('Erro ao consultar eRPJ:', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { imovel_id, numero_matricula, cartorio } = await req.json()

  if (!imovel_id || !numero_matricula || !cartorio) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  try {
    // Consultar eRPJ
    const dadosERPJ = await consultarERPJ(numero_matricula, cartorio)
    if (!dadosERPJ) {
      return NextResponse.json({ error: 'Não foi possível consultar eRPJ' }, { status: 500 })
    }

    // Salvar/atualizar no banco
    const { data: matricula, error: insertErr } = await admin
      .from('matriculas_consultadas')
      .upsert({
        imovel_id,
        numero_matricula,
        cartorio,
        proprietario: dadosERPJ.proprietario,
        area_m2: dadosERPJ.areaMagna,
        onus_hipotecas: dadosERPJ.onusHipotecas,
        sincronizado_em: new Date().toISOString(),
      }, { onConflict: 'imovel_id' })
      .select()
      .single()

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    // Alerta se há ônus/hipotecas
    if (dadosERPJ.onusHipotecas?.temOnus) {
      // TODO: Enviar notificação alertando sobre ônus
    }

    return NextResponse.json({ ok: true, matricula, dados: dadosERPJ })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
