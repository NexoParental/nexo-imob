import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function getSessionProfile(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('id, role, name').eq('id', user.id).single()
  return profile
}

// PATCH — editar conteúdo
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getSessionProfile(req)
  if (!profile) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { conteudo } = await req.json()
  if (!conteudo?.trim()) return NextResponse.json({ error: 'Conteúdo vazio' }, { status: 400 })

  // Buscar mensagem atual para salvar versão original
  const { data: msg } = await admin.from('mensagens').select('conteudo, conteudo_original, autor_id').eq('id', id).single()
  if (!msg) return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })

  // Apenas o autor pode editar
  if (msg.autor_id !== profile.id) {
    return NextResponse.json({ error: 'Apenas o autor pode editar' }, { status: 403 })
  }

  const { error } = await admin.from('mensagens').update({
    conteudo: conteudo.trim(),
    conteudo_original: msg.conteudo_original ?? msg.conteudo, // preserva o original da 1ª edição
    editado_por: profile.id,
    editado_em: new Date().toISOString(),
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — exclusão suave (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getSessionProfile(req)
  if (!profile) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (profile.role !== 'gestor') return NextResponse.json({ error: 'Apenas gestores podem excluir mensagens' }, { status: 403 })

  const { error } = await admin.from('mensagens').update({
    excluido: true,
    excluido_por: profile.id,
    excluido_em: new Date().toISOString(),
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
