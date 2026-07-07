import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlanosClient from './PlanosClient'

export default async function PlanosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, organization:organizations(id, name, plano, plano_status, trial_ends_at)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const org = profile.organization as any

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-line">
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="text-sm text-ink-soft mt-1">
          Plano atual: <strong className="capitalize">{org?.plano ?? 'trial'}</strong>
          {org?.plano_status === 'past_due' && <span className="ml-2 text-urgent font-semibold">— Pagamento em atraso</span>}
          {org?.trial_ends_at && org?.plano === 'trial' && (
            <span className="ml-2 text-ink-faint">· Trial expira em {new Date(org.trial_ends_at).toLocaleDateString('pt-BR')}</span>
          )}
        </p>
      </div>
      <PlanosClient organizationId={profile.organization_id} planoAtual={org?.plano ?? 'trial'} />
    </div>
  )
}
