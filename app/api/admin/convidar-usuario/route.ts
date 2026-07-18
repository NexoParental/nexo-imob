import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gestor') {
    return NextResponse.json({ error: 'Apenas gestores podem convidar usuários' }, { status: 403 })
  }

  const { nome, email, role } = await req.json()
  if (!nome || !email || !role) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // organization_id sempre é o da própria organização do gestor — nunca vem do body
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { name: nome, role, organization_id: profile.organization_id },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, userId: data.user.id })
}
