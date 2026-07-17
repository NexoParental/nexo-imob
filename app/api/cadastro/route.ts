import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  if (!rateLimit(rateLimitKey(req, 'cadastro'), 2, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde e tente novamente.' }, { status: 429 })
  }

  const body = await req.json()
  const { nome_imobiliaria, nome_usuario, email, senha, _hp } = body

  if (_hp) return NextResponse.json({ ok: true }) // honeypot silencioso

  if (!nome_imobiliaria || !nome_usuario || !email || !senha) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }
  if (senha.length < 8) {
    return NextResponse.json({ error: 'Senha deve ter ao menos 8 caracteres.' }, { status: 400 })
  }

  // 1. Criar usuário (email_confirm: true → acesso imediato, sem e-mail de verificação do Supabase)
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })
  if (authErr) {
    const msg = authErr.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 })
    }
    return NextResponse.json({ error: authErr.message }, { status: 400 })
  }

  const userId = authData.user!.id

  // 2. Criar organização
  const { data: org, error: orgErr } = await admin
    .from('organizations')
    .insert({ name: nome_imobiliaria, type: 'imobiliaria' })
    .select()
    .single()

  if (orgErr) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: orgErr.message }, { status: 500 })
  }

  // 3. Criar perfil gestor
  const { error: profErr } = await admin
    .from('profiles')
    .insert({ id: userId, organization_id: org.id, name: nome_usuario, email, role: 'gestor' })

  if (profErr) {
    await admin.auth.admin.deleteUser(userId)
    await admin.from('organizations').delete().eq('id', org.id)
    return NextResponse.json({ error: profErr.message }, { status: 500 })
  }

  // 4. E-mail de boas-vindas via Resend
  try {
    await resend.emails.send({
      from: 'Nexo Imob <noreply@nexo-imob.vercel.app>',
      to: email,
      subject: `Bem-vindo ao Nexo Imob, ${nome_usuario.split(' ')[0]}!`,
      html: `
        <h2>Olá, ${nome_usuario.split(' ')[0]}!</h2>
        <p>Sua conta na Nexo Imob foi criada com sucesso.</p>
        <p><strong>Imobiliária:</strong> ${nome_imobiliaria}</p>
        <p><strong>E-mail de acesso:</strong> ${email}</p>
        <p style="margin-top:16px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login"
             style="background:#D4471E;color:white;padding:10px 20px;text-decoration:none;font-weight:bold;">
            Acessar o sistema →
          </a>
        </p>
        <p style="margin-top:24px;color:#888;font-size:12px">
          Você tem 14 dias de trial gratuito. Acesse <a href="${process.env.NEXT_PUBLIC_APP_URL}/planos">nexo-imob.vercel.app/planos</a> para escolher um plano.
        </p>
      `,
    })
  } catch {
    // Não falhar o cadastro por erro de e-mail
  }

  return NextResponse.json({ ok: true, organization_id: org.id })
}
