import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TIPO_LABELS: Record<string, string> = {
  notificacao_extrajudicial: 'Notificação Extrajudicial',
  carta_cobranca: 'Carta de Cobrança',
  aviso_despejo: 'Aviso de Despejo',
  distrato: 'Distrato de Contrato',
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { tipo, demanda_id } = await req.json()
  if (!tipo || !demanda_id) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const { data: demanda } = await supabase
    .from('demandas')
    .select(`*,
      contrato:contratos(*,
        proprietario:pessoas!contratos_proprietario_id_fkey(nome, email, cpf, endereco),
        inquilino:pessoas!contratos_inquilino_id_fkey(nome, email, cpf, endereco),
        fiador:pessoas!contratos_fiador_id_fkey(nome, cpf),
        imovel:imoveis(*)
      )
    `)
    .eq('id', demanda_id)
    .single()

  if (!demanda) return NextResponse.json({ error: 'Demanda não encontrada' }, { status: 404 })

  const contrato = demanda.contrato as any
  const imovel = contrato?.imovel as any
  const inquilino = contrato?.inquilino as any
  const proprietario = contrato?.proprietario as any
  const fiador = contrato?.fiador as any

  const contexto = `
Dados do contrato nº ${contrato?.numero ?? '—'}:
- Tipo: ${contrato?.tipo ?? '—'}
- Imóvel: ${imovel?.logradouro}, ${imovel?.numero}${imovel?.complemento ? `, ${imovel.complemento}` : ''} — ${imovel?.bairro}, ${imovel?.cidade}/${imovel?.uf}
- Proprietário: ${proprietario?.nome ?? '—'} (CPF: ${proprietario?.cpf ?? '—'})
- Inquilino: ${inquilino?.nome ?? '—'} (CPF: ${inquilino?.cpf ?? '—'})${fiador ? `\n- Fiador: ${fiador.nome} (CPF: ${fiador.cpf ?? '—'})` : ''}
- Valor mensal: R$ ${Number(contrato?.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Início: ${contrato?.data_inicio ? new Date(contrato.data_inicio).toLocaleDateString('pt-BR') : '—'}
- Prazo: ${contrato?.prazo_meses ? `${contrato.prazo_meses} meses` : 'indeterminado'}
- Garantia: ${contrato?.tipo_garantia ?? '—'}
- Status: ${contrato?.status ?? '—'}

Dados da demanda protocolo ${demanda.protocolo}:
- Tipo: ${demanda.tipo}
- Urgência: ${demanda.urgencia}
- Status atual: ${demanda.status}
${demanda.prazo ? `- Prazo: ${new Date(demanda.prazo).toLocaleDateString('pt-BR')}` : ''}
  `.trim()

  const instrucoes: Record<string, string> = {
    notificacao_extrajudicial: `Gere uma notificação extrajudicial completa e formal, em português jurídico brasileiro, baseada nos dados abaixo.
Inclua: cabeçalho, qualificação das partes, descrição do fato (inadimplência ou infração contratual), prazo para regularização (3 dias úteis),
advertência sobre medidas judiciais cabíveis, local/data, espaço para assinatura do advogado notificante.`,
    carta_cobranca: `Gere uma carta de cobrança formal e profissional, em português claro, para envio direto ao inquilino inadimplente.
Inclua: referência ao contrato e imóvel, valores devidos, prazo para pagamento (5 dias), formas de contato para regularização amigável.`,
    aviso_despejo: `Gere um aviso formal de despejo extrajudicial, com base nos dados abaixo.
Inclua: fundamento legal (Lei 8.245/91), motivo do despejo, prazo para desocupação voluntária (30 dias), consequências do não cumprimento.`,
    distrato: `Gere uma minuta de distrato de contrato de locação completo, em formato jurídico.
Inclua: qualificação completa das partes, objeto (identificação do contrato e imóvel), cláusulas de rescisão, quitação mútua, devolução do imóvel,
devolução de caução (se aplicável), multa rescisória (se aplicável), data e espaços para assinaturas e 2 testemunhas.`,
  }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `${instrucoes[tipo] ?? 'Gere o documento jurídico adequado.'}\n\nCONTEXTO:\n${contexto}`,
      }],
    })

    const conteudo = (msg.content[0] as any).text?.trim() ?? ''
    const titulo = TIPO_LABELS[tipo] ?? tipo

    const { data: docGerado, error: docErr } = await admin
      .from('documentos_gerados')
      .insert({ demanda_id, tipo, titulo, conteudo, gerado_por: user.id })
      .select()
      .single()

    if (docErr) return NextResponse.json({ error: docErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, documento: { id: docGerado.id, titulo, conteudo, tipo } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 })
  }
}
