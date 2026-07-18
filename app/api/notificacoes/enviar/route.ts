import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const { usuario_id, tipo, demanda_id, titulo, descricao } = await req.json()
  if (!usuario_id || !tipo || !titulo) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // O destinatário precisa pertencer à mesma organização de quem está disparando a notificação
  const { data: destinatario } = await admin
    .from('profiles')
    .select('organization_id, email')
    .eq('id', usuario_id)
    .single()

  if (!destinatario || destinatario.organization_id !== profile.organization_id) {
    return NextResponse.json({ error: 'Destinatário inválido' }, { status: 403 })
  }

  try {
    // 1. Registrar notificação no banco
    const { data: notif, error: notifErr } = await admin
      .from('notificacoes_enviadas')
      .insert({ usuario_id, tipo, demanda_id, titulo, descricao })
      .select()
      .single()

    if (notifErr) return NextResponse.json({ error: notifErr.message }, { status: 500 })

    // 2. Enviar por email se configurado — sempre para o e-mail cadastrado do destinatário, nunca o do body
    const { data: config } = await admin
      .from('notificacoes_config')
      .select('email')
      .eq('usuario_id', usuario_id)
      .single()

    if (config?.email && destinatario.email) {
      await resend.emails.send({
        from: 'Nexo Imob <notificacoes@nexoimob.com.br>',
        to: destinatario.email,
        subject: titulo,
        html: `<p>${descricao || titulo}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Ver na plataforma</a></p>`,
      })
    }

    return NextResponse.json({ ok: true, notif })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
