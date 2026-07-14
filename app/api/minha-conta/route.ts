import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as adminClient } from '@supabase/supabase-js'

const admin = adminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// DELETE /api/minha-conta — exclusão de conta conforme LGPD art. 18
export async function DELETE(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await admin
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  // Gestor único não pode excluir sozinho — protege a organização
  if (profile?.role === 'gestor') {
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)
      .eq('role', 'gestor')

    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: 'Você é o único gestor. Transfira a gestão antes de excluir a conta.' },
        { status: 400 }
      )
    }
  }

  // Anonimizar perfil (mantém histórico de demandas intacto por obrigação legal)
  await admin.from('profiles').update({
    name: '[Conta excluída]',
    email: `deleted_${user.id}@nexo-imob.invalid`,
    ativo: false,
  }).eq('id', user.id)

  // Revogar sessão e excluir usuário do auth
  await supabase.auth.signOut()
  await admin.auth.admin.deleteUser(user.id)

  return NextResponse.json({ ok: true })
}
