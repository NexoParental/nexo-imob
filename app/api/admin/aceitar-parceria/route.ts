import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 })

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Token inválido' }, { status: 400 })

  // Buscar convite válido
  const { data: convite } = await admin
    .from('convites_parceria')
    .select('*, de_org:organizations!convites_parceria_de_org_id_fkey(id, name, type)')
    .eq('token', token)
    .eq('aceito', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!convite) {
    return NextResponse.json({ error: 'Convite não encontrado ou expirado' }, { status: 404 })
  }

  // Pegar org do usuário que está aceitando
  const { data: profile } = await admin
    .from('profiles')
    .select('organization_id, organization:organizations(id, type)')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const deOrg = convite.de_org as any
  const minhaOrg = profile.organization as any

  // Determinar imobiliária e jurídico
  let imobiliaria_id: string, juridico_id: string
  if (deOrg.type === 'imobiliaria' && minhaOrg.type === 'juridico') {
    imobiliaria_id = deOrg.id
    juridico_id = profile.organization_id
  } else if (deOrg.type === 'juridico' && minhaOrg.type === 'imobiliaria') {
    imobiliaria_id = profile.organization_id
    juridico_id = deOrg.id
  } else {
    return NextResponse.json({ error: 'A parceria deve ser entre uma imobiliária e um escritório jurídico' }, { status: 400 })
  }

  // Criar parceria
  const { error: pErr } = await admin
    .from('parcerias')
    .upsert({ imobiliaria_id, juridico_id, ativo: true }, { onConflict: 'imobiliaria_id,juridico_id' })

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

  // Marcar convite como aceito
  await admin.from('convites_parceria').update({ aceito: true }).eq('token', token)

  return NextResponse.json({ ok: true, parceiro: deOrg.name })
}
