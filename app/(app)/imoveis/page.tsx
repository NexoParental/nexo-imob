import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatusContratoBadge } from '@/components/ui'

export default async function ImoveisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  const { data: imoveis } = await supabase
    .from('imoveis')
    .select('*, proprietario:pessoas(nome)')
    .eq('organization_id', profile!.organization_id)
    .order('logradouro')

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">Cadastros</div>
          <h1 className="text-2xl font-bold tracking-tight">Imóveis</h1>
        </div>
        <Link href="/imoveis/novo" className="bg-accent text-white text-sm font-semibold px-4 py-2.5 hover:bg-accent-deep transition-colors">
          + Novo imóvel
        </Link>
      </div>
      <div className="bg-surface border border-line overflow-hidden">
        <div className="grid px-4 py-2 bg-surface-alt text-[10.5px] uppercase tracking-widest text-ink-faint font-semibold" style={{gridTemplateColumns:'1.6fr 120px 1fr 130px 100px'}}>
          <div>Endereço</div><div>Tipo</div><div>Proprietário</div><div>Matrícula</div><div>Situação</div>
        </div>
        {(imoveis ?? []).map(im => (
          <Link
            key={im.id}
            href={`/imoveis/${im.id}`}
            className="grid items-center px-4 py-3 border-b border-line hover:bg-surface-alt transition-colors text-sm"
            style={{gridTemplateColumns:'1.6fr 120px 1fr 130px 100px'}}
          >
            <div className="font-semibold">{im.logradouro}, {im.numero}{im.complemento ? `, ${im.complemento}` : ''}<div className="text-xs text-ink-faint font-normal">{im.bairro} — {im.cidade}/{im.uf}</div></div>
            <div className="text-ink-soft capitalize">{im.tipo}</div>
            <div>{(im as any).proprietario?.nome ?? '—'}</div>
            <div className="font-mono text-xs">{im.matricula ?? '—'}</div>
            <div><span className="text-xs bg-surface-alt border border-line px-2 py-0.5 text-ink-soft">Ver</span></div>
          </Link>
        ))}
        {!(imoveis ?? []).length && <p className="text-sm text-ink-faint text-center py-10">Nenhum imóvel cadastrado ainda.</p>}
      </div>
    </div>
  )
}
