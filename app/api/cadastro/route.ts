import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, rateLimitKey } from '@/lib/rate-limit'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  // Rate limit: 2 cadastros por hora por IP
  if (!rateLimit(rateLimitKey(req, 'cadastro'), 2, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde e tente novamente.' }, { status: 429 })
  }

  const body = await req.json()
  const { nome_imobiliaria, nome_usuario, email, senha, _hp } = body

  // Honeypot: campo oculto preenchido = bot
  if (_hp) return NextResponse.json({ ok: true }) // rejeição silenciosa

  if (!nome_imobiliaria || !nome_usuario || !email || !senha) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: false,
  })
  if (authErr) {
    if (authErr.message.includes('already registered')) {
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

  // 3. Criar perfil (gestor por padrão)
  const { error: profErr } = await admin
    .from('profiles')
    .insert({ id: userId, organization_id: org.id, name: nome_usuario, email, role: 'gestor' })

  if (profErr) {
    await admin.auth.admin.deleteUser(userId)
    await admin.from('organizations').delete().eq('id', org.id)
    return NextResponse.json({ error: profErr.message }, { status: 500 })
  }

  // 4. Enviar e-mail de confirmação (invitation flow)
  await admin.auth.admin.generateLink({ type: 'signup', email, password: senha })

  return NextResponse.json({ ok: true, organization_id: org.id })
}
