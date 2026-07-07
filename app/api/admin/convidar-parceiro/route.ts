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
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gestor') {
    return NextResponse.json({ error: 'Apenas gestores podem convidar parceiros' }, { status: 403 })
  }

  const { para_email } = await req.json()
  if (!para_email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })

  // Criar convite
  const { data: convite, error: convErr } = await admin
    .from('convites_parceria')
    .insert({ de_org_id: profile.organization_id, para_email })
    .select('token')
    .single()

  if (convErr) return NextResponse.json({ error: convErr.message }, { status: 500 })

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/aceitar-parceria?token=${convite.token}`
  const orgName = (profile.organization as any)?.name ?? 'uma imobiliária'

  const { error: emailErr } = await resend.emails.send({
    from: 'Nexo Imob <noreply@nexoimob.com.br>',
    to: para_email,
    subject: `${orgName} quer se conectar com você no Nexo Imob`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#2B2B2B">
        <div style="background:#2B2B2B;padding:20px 24px;margin-bottom:32px">
          <span style="color:#D4471E;font-weight:bold;font-size:18px">Nexo Imob</span>
        </div>
        <h2 style="margin:0 0 12px">Convite de parceria</h2>
        <p style="color:#555;margin:0 0 24px">
          <strong>${orgName}</strong> convidou sua organização para ser parceira no Nexo Imob.
          Com a parceria ativa, você poderá visualizar os contratos e cadastros da imobiliária
          e acompanhar as demandas jurídicas em tempo real.
        </p>
        <a href="${url}"
           style="display:inline-block;background:#D4471E;color:#fff;font-weight:600;
                  padding:12px 24px;text-decoration:none;margin-bottom:32px">
          Aceitar parceria
        </a>
        <p style="font-size:12px;color:#999">
          Este link expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo.
        </p>
      </div>
    `,
  })

  if (emailErr) {
    await admin.from('convites_parceria').delete().eq('token', convite.token)
    return NextResponse.json({ error: 'Falha ao enviar e-mail' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
