import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { usuario_id, tipo, demanda_id, titulo, descricao, email_endereco } = await req.json()

  try {
    // 1. Registrar notificação no banco
    const { data: notif, error: notifErr } = await admin
      .from('notificacoes_enviadas')
      .insert({ usuario_id, tipo, demanda_id, titulo, descricao })
      .select()
      .single()

    if (notifErr) return NextResponse.json({ error: notifErr.message }, { status: 500 })

    // 2. Enviar por email se configurado
    const { data: config } = await admin
      .from('notificacoes_config')
      .select('email, sms')
      .eq('usuario_id', usuario_id)
      .single()

    if (config?.email && email_endereco) {
      await resend.emails.send({
        from: 'Nexo Imob <notificacoes@nexoimob.com.br>',
        to: email_endereco,
        subject: titulo,
        html: `<p>${descricao || titulo}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Ver na plataforma</a></p>`,
      })
    }

    // 3. TODO: Enviar SMS se configurado (Zenvia API)
    // if (config?.sms) { await enviarSMS(...) }

    return NextResponse.json({ ok: true, notif })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
