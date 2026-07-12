import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LABELS_ROLE } from '@/lib/utils'
import ConvidarUsuarioForm from './ConvidarUsuarioForm'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('organization_id, role').eq('id', user.id).single()
  if (profile?.role !== 'gestor') redirect('/dashboard')

  const { data: usuarios } = await supabase
    .from('profiles')
    .select('*, organization:organizations(name)')
    .eq('organization_id', profile.organization_id)
    .order('created_at')

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">Administração</div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-5">
        <div className="bg-surface border border-line overflow-hidden">
          <div className="grid px-4 py-2 bg-surface-alt text-[10.5px] uppercase tracking-widest text-ink-faint font-semibold" style={{gridTemplateColumns:'1fr 120px 100px 80px'}}>
            <div>Nome</div><div>Papel</div><div>Status</div><div></div>
          </div>
          {(usuarios ?? []).map(u => (
            <div key={u.id} className="grid items-center px-4 py-3 border-b border-line last:border-b-0 text-sm" style={{gridTemplateColumns:'1fr 120px 100px 80px'}}>
              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-xs text-ink-faint">{u.email}</div>
              </div>
              <div className="text-ink-soft capitalize">{LABELS_ROLE[u.role as keyof typeof LABELS_ROLE]}</div>
              <div><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.ativo ? 'bg-success-bg text-success' : 'bg-urgent-bg text-urgent'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span></div>
              <div className="text-xs text-ink-faint">{u.id === user.id ? 'Você' : '—'}</div>
            </div>
          ))}
        </div>
        <ConvidarUsuarioForm organizationId={profile.organization_id} />
      </div>
    </div>
  )
}
