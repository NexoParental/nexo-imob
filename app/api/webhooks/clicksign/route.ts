import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const body = await req.json()

  const event = body.event
  const docKey = body.document?.key

  if (!docKey || !event) {
    return NextResponse.json({ ok: true })
  }

  // Atualizar campo storage_path do documento com o status atual
  if (event === 'sign') {
    await admin
      .from('documentos')
      .update({ nome: `Assinatura eletrônica (parcial) — ${docKey}` })
      .eq('storage_path', `clicksign://${docKey}`)
  }

  if (event === 'close' || event === 'finished') {
    await admin
      .from('documentos')
      .update({ nome: `Assinatura eletrônica (concluída) — ${docKey}` })
      .eq('storage_path', `clicksign://${docKey}`)
  }

  return NextResponse.json({ ok: true })
}
