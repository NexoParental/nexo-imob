import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const { contrato_id } = await req.json()
  if (!contrato_id) return NextResponse.json({ error: 'contrato_id obrigatório' }, { status: 400 })

  const { data: contrato } = await supabase
    .from('contratos')
    .select(`*, imovel:imoveis(*), proprietario:pessoas!contratos_proprietario_id_fkey(*), inquilino:pessoas!contratos_inquilino_id_fkey(*), fiador:pessoas!contratos_fiador_id_fkey(*)`)
    .eq('id', contrato_id)
    .single()

  if (!contrato) return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })

  const im = contrato.imovel as any
  const prop = contrato.proprietario as any
  const inq = contrato.inquilino as any
  const fiad = contrato.fiador as any

  const textoContrato = `
CONTRATO Nº ${contrato.numero}
Tipo: ${contrato.tipo}
Status: ${contrato.status}

IMÓVEL: ${im?.logradouro}, ${im?.numero}${im?.complemento ? `, ${im.complemento}` : ''} — ${im?.bairro}, ${im?.cidade}/${im?.uf}
Matrícula: ${im?.matricula ?? 'não informada'} — Cartório: ${im?.cartorio ?? 'não informado'}

PARTES:
- Proprietário: ${prop?.nome ?? '—'} (${prop?.cpf ?? prop?.cnpj ?? 'sem doc'})
- Inquilino/Comprador: ${inq?.nome ?? '—'} (${inq?.cpf ?? inq?.cnpj ?? 'sem doc'}) — ${inq?.email ?? ''} — ${inq?.telefone ?? ''}
- Garantia: ${contrato.tipo_garantia}${fiad ? ` — Fiador: ${fiad.nome}` : ''}${contrato.garantia_descricao ? ` (${contrato.garantia_descricao})` : ''}

CONDIÇÕES FINANCEIRAS:
- Início: ${contrato.data_inicio}
- Prazo: ${contrato.prazo_meses ? `${contrato.prazo_meses} meses` : 'indeterminado'}
- Valor mensal: R$ ${Number(contrato.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Índice de reajuste: ${contrato.indice_reajuste ?? 'não definido'}
  `.trim()

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Você é um assistente jurídico especializado em contratos imobiliários brasileiros. Analise o contrato abaixo e retorne um JSON com exatamente estas chaves:

{
  "partes": "resumo das partes envolvidas",
  "valores": "resumo dos valores e condições financeiras",
  "prazos": "resumo dos prazos relevantes",
  "clausulas_risco": ["lista de pontos de atenção ou risco"],
  "tipo_garantia": "análise da garantia contratual",
  "resumo_geral": "parágrafo curto com avaliação geral do contrato"
}

Retorne APENAS o JSON, sem texto antes ou depois.

CONTRATO:
${textoContrato}`,
    }],
  })

  const raw = (msg.content[0] as any).text?.trim() ?? ''
  let analise: Record<string, unknown>
  try {
    analise = JSON.parse(raw)
  } catch {
    analise = { resumo_geral: raw }
  }

  return NextResponse.json({ ok: true, analise })
}
