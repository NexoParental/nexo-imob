import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// DataJud API pública — https://datajud-wiki.cnj.jus.br
// Endpoint de busca por número único do processo (NPU)
async function consultarDataJud(numeroProcesso: string) {
  const clean = numeroProcesso.replace(/\D/g, '')
  if (clean.length !== 20) {
    throw new Error('Número do processo inválido. Use o formato NPU com 20 dígitos (NNNNNNN-DD.AAAA.J.TT.OOOO).')
  }

  // Identificar tribunal pelo segmento de justiça (posição 13-14 do NPU)
  const segmento = clean.slice(13, 14) // 8=TJ, 4=TRF, 5=TRT…
  const tribunal = clean.slice(14, 16)

  // Mapeamento dos principais tribunais
  const tribunalMap: Record<string, string> = {
    '8-26': 'tjsp', '8-19': 'tjmg', '8-21': 'tjrs', '8-06': 'tjpr',
    '8-08': 'tjsc', '8-16': 'tjba', '8-22': 'tjce', '8-07': 'tjrj',
    '4-01': 'trf1', '4-02': 'trf2', '4-03': 'trf3', '4-04': 'trf4', '4-05': 'trf5',
    '1-00': 'stj',  '2-00': 'stf',
  }
  const tribunalKey = `${segmento}-${tribunal}`
  const tribunalId = tribunalMap[tribunalKey] || `tj${tribunal.padStart(2, '0')}`

  const url = `https://api-publica.datajud.cnj.jus.br/api_publica_${tribunalId}/_search`
  const body = {
    query: { match: { numeroProcesso: numeroProcesso.replace(/\s/g, '') } },
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'ApiKey cDZHYzlZa0JadVREZDJCendFbzVlQTU2UFV1ZFZlQ2RqcHBOSHRTc0hoc' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`DataJud retornou ${resp.status}: ${text.slice(0, 200)}`)
  }

  const json = await resp.json()
  const hits = json?.hits?.hits ?? []
  if (hits.length === 0) throw new Error('Processo não encontrado no DataJud. Verifique o número informado.')

  const proc = hits[0]._source
  const movimentos = (proc.movimentos ?? [])
    .sort((a: any, b: any) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
    .slice(0, 10)
    .map((m: any) => ({
      data: m.dataHora,
      descricao: m.nome ?? m.complementosTabelados?.[0]?.nome ?? 'Movimentação',
    }))

  return {
    numeroProcesso,
    status: proc.nivelSigilo === 0 ? 'EM_ANDAMENTO' : 'SIGILOSO',
    classe: proc.classe?.nome ?? '',
    assunto: proc.assuntos?.[0]?.nome ?? '',
    orgaoJulgador: proc.orgaoJulgador?.nome ?? '',
    dataAjuizamento: proc.dataAjuizamento ?? null,
    movimentos,
    updated_at: new Date().toISOString(),
  }
}

export async function POST(req: NextRequest) {
  const { numero_processo, demanda_id } = await req.json()

  if (!numero_processo || !demanda_id) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  try {
    const dadosCNJ = await consultarDataJud(numero_processo)

    const { error: upsertErr } = await admin
      .from('processos_cnj')
      .upsert({
        demanda_id,
        numero_processo,
        status: dadosCNJ.status,
        data_andamento: dadosCNJ.updated_at,
        proximos_prazos: dadosCNJ.movimentos.map((m: any) => m.descricao),
        sincronizado_em: new Date().toISOString(),
      }, { onConflict: 'numero_processo' })

    if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, dados: dadosCNJ })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data: processos } = await admin
      .from('processos_cnj')
      .select('numero_processo, demanda_id')
      .not('numero_processo', 'is', null)

    if (!processos || processos.length === 0) {
      return NextResponse.json({ sincronizados: 0, erros: 0 })
    }

    let sincronizados = 0
    let erros = 0

    for (const proc of processos) {
      try {
        const dadosCNJ = await consultarDataJud(proc.numero_processo)
        await admin
          .from('processos_cnj')
          .update({
            status: dadosCNJ.status,
            data_andamento: dadosCNJ.updated_at,
            proximos_prazos: dadosCNJ.movimentos.map((m: any) => m.descricao),
            sincronizado_em: new Date().toISOString(),
          })
          .eq('numero_processo', proc.numero_processo)
        sincronizados++
      } catch {
        erros++
      }
    }

    return NextResponse.json({ sincronizados, erros, total: processos.length })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
