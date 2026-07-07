import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CLICKSIGN_BASE = 'https://app.clicksign.com/api/v1'
const CLICKSIGN_TOKEN = process.env.CLICKSIGN_ACCESS_TOKEN

// Cria um documento no Clicksign a partir de um base64 PDF
async function criarDocumento(nomeArquivo: string, conteudoBase64: string) {
  const res = await fetch(`${CLICKSIGN_BASE}/documents?access_token=${CLICKSIGN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document: {
        path: `/${nomeArquivo}`,
        content_base64: `data:application/pdf;base64,${conteudoBase64}`,
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

async function adicionarSignatario(docKey: string, nome: string, email: string, acao = 'sign') {
  // Criar signatário
  const resSig = await fetch(`${CLICKSIGN_BASE}/signers?access_token=${CLICKSIGN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signer: { name: nome, email, phone_number: null, auth: { type: 'email' }, sign_as: acao, selfie_enabled: false },
    }),
  })
  if (!resSig.ok) throw new Error(`Clicksign criar signatário: ${await resSig.text()}`)
  const { signer } = await resSig.json()

  // Associar ao documento
  const resAdd = await fetch(`${CLICKSIGN_BASE}/lists?access_token=${CLICKSIGN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ list: { document_key: docKey, signer_key: signer.key, sign_as: acao, message: 'Por favor, assine o contrato.' } }),
  })
  if (!resAdd.ok) throw new Error(`Clicksign associar: ${await resAdd.text()}`)
  return signer
}

async function notificarSignatario(docKey: string, signerKey: string) {
  await fetch(`${CLICKSIGN_BASE}/notifications?access_token=${CLICKSIGN_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { document_key: docKey, signer_key: signerKey, message: 'Contrato aguardando sua assinatura eletrônica.' } }),
  })
}

export async function POST(req: NextRequest) {
  if (!CLICKSIGN_TOKEN) {
    return NextResponse.json({ error: 'CLICKSIGN_ACCESS_TOKEN não configurado' }, { status: 503 })
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
  const inq = contrato.inquilino as any
  const fiad = contrato.fiador as any

  // Validar e-mails necessários
  const signatarios: { nome: string; email: string; papel: string }[] = []
  if (prop?.email) signatarios.push({ nome: prop.nome, email: prop.email, papel: 'Proprietário' })
  if (inq?.email) signatarios.push({ nome: inq.nome, email: inq.email, papel: 'Inquilino/Comprador' })
  if (fiad?.email) signatarios.push({ nome: fiad.nome, email: fiad.email, papel: 'Fiador' })

  if (signatarios.length === 0) {
    return NextResponse.json({ error: 'Nenhuma parte possui e-mail cadastrado. Atualize as fichas das pessoas antes de enviar.' }, { status: 400 })
  }

  try {
    const im = contrato.imovel as any
    const nomeArquivo = `Contrato_${contrato.numero}_${im?.bairro ?? 'Imovel'}.pdf`.replace(/\s/g, '_')

    // PDF mínimo em base64 — placeholder até ter geração real
    // Em produção, buscar o PDF do Supabase Storage ou gerar via PDFKit
    const pdfPlaceholder = btoa(`%PDF-1.4\n1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj 2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj 3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer<</Size 4 /Root 1 0 R>>\nstartxref\n190\n%%EOF`)

    // Criar documento no Clicksign
    const { document } = await criarDocumento(nomeArquivo, pdfPlaceholder)
    const docKey = document.key

    // Adicionar signatários e notificar
    const signerKeys: string[] = []
    for (const s of signatarios) {
      const signer = await adicionarSignatario(docKey, s.nome, s.email)
      signerKeys.push(signer.key)
    }

    // Finalizar / ativar documento
    await fetch(`${CLICKSIGN_BASE}/documents/${docKey}/finish?access_token=${CLICKSIGN_TOKEN}`, { method: 'PATCH' })

    // Notificar todos
    for (const sk of signerKeys) {
      await notificarSignatario(docKey, sk)
    }

    // Salvar referência no banco
    await admin.from('documentos').insert({
      contrato_id,
      nome: `Assinatura eletrônica — ${nomeArquivo}`,
      storage_path: `clicksign://${docKey}`,
      mime_type: 'application/pdf',
      tamanho_bytes: 0,
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

// Consultar status de assinatura
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
