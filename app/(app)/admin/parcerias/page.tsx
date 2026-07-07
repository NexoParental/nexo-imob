import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConvidarParceiroForm from './ConvidarParceiroForm'

export default async function ParceriasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gestor') redirect('/dashboard')

  const org = profile.organization as any

  const { data: parcerias } = await supabase
    .from('parcerias')
    .select('*, imobiliaria:organizations!parcerias_imobiliaria_id_fkey(name), juridico:organizations!parcerias_juridico_id_fkey(name)')
    .or(`imobiliaria_id.eq.${profile.organization_id},juridico_id.eq.${profile.organization_id}`)

  const { data: convitesPendentes } = await supabase
    .from('convites_parceria')
    .select('*')
    .eq('de_org_id', profile.organization_id)
    .eq('aceito', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-5 pb-4 border-b border-line">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">Admin</div>
        <h1 className="text-2xl font-bold tracking-tight">Parcerias</h1>
        <p className="text-sm text-ink-soft mt-1">
          {org?.type === 'imobiliaria'
            ? 'Escritórios jurídicos conectados — podem visualizar seus contratos e demandas.'
            : 'Imobiliárias conectadas — você visualiza os contratos e cadastros delas.'}
        </p>
      </div>

      {/* Parcerias ativas */}
      <section className="mb-8">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Parcerias ativas</h2>
        {(parcerias ?? []).length === 0 ? (
          <p className="text-sm text-ink-faint py-6 text-center border border-dashed border-line">
            Nenhuma parceria ativa ainda. Convide um parceiro abaixo.
          </p>
        ) : (
          <div className="bg-surface border border-line">
            {parcerias!.map(p => {
              const parceiro = org?.type === 'imobiliaria'
                ? (p.juridico as any)?.name
                : (p.imobiliaria as any)?.name
              const tipo = org?.type === 'imobiliaria' ? 'Escritório jurídico' : 'Imobiliária'
              return (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-line last:border-b-0">
                  <div>
                    <span className="font-semibold text-sm">{parceiro}</span>
                    <span className="ml-2 text-[11px] bg-success-bg text-success px-2 py-0.5 rounded-full">{tipo}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.ativo ? 'bg-success-bg text-success' : 'bg-surface-alt text-ink-faint'}`}>
                    {p.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Convites pendentes */}
      {(convitesPendentes ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Convites enviados (aguardando aceite)</h2>
          <div className="bg-surface border border-line">
            {convitesPendentes!.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 border-b border-line last:border-b-0 text-sm">
                <span>{c.para_email}</span>
                <span className="text-xs text-warning bg-warning-bg px-2 py-0.5 rounded-full">Pendente</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formulário de convite */}
      <ConvidarParceiroForm orgType={org?.type} />
    </div>
  )
}
