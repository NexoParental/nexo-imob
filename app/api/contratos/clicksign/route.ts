import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { gerarPDFContrato } from '@/lib/pdf/contrato'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CLICKSIGN_BASE = 'https://app.clicksign.com/api/v1'
const CLICKSIGN_TOKEN = process.env.CLICKSIGN_ACCESS_TOKEN

async function criarDocumento(nomeArquivo: string, pdfBuffer: Buffer) {
  const res = await fetch(`${CLICKSIGN_BASE}/documents?access_token=${CLICKSIGN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document: {
        path: `/${nomeArquivo}`,
        content_base64: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
        deadline_at: null,
        auto_close: true,
        locale: 'pt-BR',
        sequence_enabled: false,
      },
    }),
  })
  if (!res.ok) throw new Error(`Clicksign criar doc: ${await res.text()}`)
  return res.json()
}

async function adicionarSignatario(docKey: string, nome: string, email: string) {
  const resSig = await fetch(`${CLICKSIGN_BASE}/signers?access_token=${CLICKSIGN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signer: { name: nome, email, phone_number: null, auth: { type: 'email' }, sign_as: 'sign', selfie_enabled: false },
    }),
  })
  if (!resSig.ok) throw new Error(`Clicksign criar signatário: ${await resSig.text()}`)
  const { signer } = await resSig.json()

  const resAdd = await fetch(`${CLICKSIGN_BASE}/lists?access_token=${CLICKSIGN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      list: { document_key: docKey, signer_key: signer.key, sign_as: 'sign', message: 'Por favor, assine o contrato.' },
    }),
  })
  if (!resAdd.ok) throw new Error(`Clicksign associar: ${await resAdd.text()}`)
  return signer
}

async function notificarSignatario(docKey: string, signerKey: string) {
  await fetch(`${CLICKSIGN_BASE}/notifications?access_token=${CLICKSIGN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: { document_key: docKey, signer_key: signerKey, message: 'Contrato aguardando sua assinatura eletrônica.' },
    }),
  })
}

export async function POST(req: NextRequest) {
  if (!CLICKSIGN_TOKEN) {
    return NextResponse.json({ error: 'CLICKSIGN_ACCESS_TOKEN não configurado no servidor.' }, { status: 503 })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { contrato_id } = await req.json()
  if (!contrato_id) return NextResponse.json({ error: 'contrato_id obrigatório' }, { status: 400 })

  const { data: contrato } = await supabase
    .from('contratos')
    .select(`*, imovel:imoveis(*), proprietario:pessoas!contratos_proprietario_id_fkey(*), inquilino:pessoas!contratos_inquilino_id_fkey(*), fiador:pessoas!contratos_fiador_id_fkey(*)`)
    .eq('id', contrato_id)
    .single()

  if (!contrato) return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })

  const prop = contrato.proprietario as any
  const inq  = contrato.inquilino  as any
  const fiad = contrato.fiador     as any

  const signatarios: { nome: string; email: string }[] = []
  if (prop?.email) signatarios.push({ nome: prop.nome, email: prop.email })
  if (inq?.email)  signatarios.push({ nome: inq.nome,  email: inq.email })
  if (fiad?.email) signatarios.push({ nome: fiad.nome, email: fiad.email })

  if (signatarios.length === 0) {
    return NextResponse.json({
      error: 'Nenhuma parte possui e-mail cadastrado. Atualize as fichas das pessoas antes de enviar.',
    }, { status: 400 })
  }

  try {
    const im = contrato.imovel as any
    const nomeArquivo = `Contrato_${contrato.numero}_${(im?.bairro ?? 'Imovel').replace(/\s/g, '_')}.pdf`

    // Gerar PDF real do contrato
    const pdfBuffer = await gerarPDFContrato({
      numero: contrato.numero,
      tipo: contrato.tipo,
      status: contrato.status,
      data_inicio: contrato.data_inicio,
      prazo_meses: contrato.prazo_meses,
      valor: Number(contrato.valor),
      indice_reajuste: contrato.indice_reajuste,
      tipo_garantia: contrato.tipo_garantia,
      garantia_descricao: contrato.garantia_descricao,
      imovel: im,
      proprietario: prop,
      inquilino: inq,
      fiador: fiad,
    })

    // Criar documento no Clicksign com PDF real
    const { document } = await criarDocumento(nomeArquivo, pdfBuffer)
    const docKey = document.key

    // Adicionar signatários
    const signerKeys: string[] = []
    for (const s of signatarios) {
      const signer = await adicionarSignatario(docKey, s.nome, s.email)
      signerKeys.push(signer.key)
    }

    // Finalizar / ativar documento
    await fetch(`${CLICKSIGN_BASE}/documents/${docKey}/finish?access_token=${CLICKSIGN_TOKEN}`, { method: 'PATCH' })

    // Notificar todos
    for (const sk of signerKeys) await notificarSignatario(docKey, sk)

    // Registrar no banco
    await admin.from('documentos').insert({
      contrato_id,
      nome: `Assinatura eletrônica — ${nomeArquivo}`,
      storage_path: `clicksign://${docKey}`,
      mime_type: 'application/pdf',
      tamanho_bytes: pdfBuffer.length,
      uploaded_by: user.id,
    })

    return NextResponse.json({
      ok: true,
      doc_key: docKey,
      signatarios: signatarios.map(s => s.email),
      url: `https://app.clicksign.com/sign/${docKey}`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!CLICKSIGN_TOKEN) return NextResponse.json({ error: 'Não configurado' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const docKey = searchParams.get('doc_key')
  if (!docKey) return NextResponse.json({ error: 'doc_key obrigatório' }, { status: 400 })

  const res = await fetch(`${CLICKSIGN_BASE}/documents/${docKey}?access_token=${CLICKSIGN_TOKEN}`)
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status })

  const { document } = await res.json()
  return NextResponse.json({
    status: document.status,
    signers: (document.signers ?? []).map((s: any) => ({
      nome: s.name,
      email: s.email,
      signed: !!s.signed_at,
      signed_at: s.signed_at,
    })),
  })
}
