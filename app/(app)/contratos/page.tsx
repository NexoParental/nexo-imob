import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatusContratoBadge } from '@/components/ui'
import { formatDate } from '@/lib/utils'

export default async function ContratosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()

  const { data: contratos } = await supabase
    .from('contratos')
    .select('*, imovel:imoveis(logradouro, numero), proprietario:pessoas!contratos_proprietario_id_fkey(nome), inquilino:pessoas!contratos_inquilino_id_fkey(nome)')
    .eq('organization_id', profile!.organization_id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">Cadastros</div>
          <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
        </div>
        <Link href="/contratos/novo" className="bg-accent text-white text-sm font-semibold px-4 py-2.5 hover:bg-accent-deep transition-colors">+ Novo contrato</Link>
      </div>
      <div className="bg-surface border border-line overflow-hidden">
        <div className="grid px-4 py-2 bg-surface-alt text-[10.5px] uppercase tracking-widest text-ink-faint font-semibold" style={{gridTemplateColumns:'80px 130px 1.3fr 1.2fr 110px 110px'}}>
          <div>Nº</div><div>Tipo</div><div>Imóvel</div><div>Partes</div><div>Vigência</div><div>Status</div>
        </div>
        {(contratos ?? []).map(c => (
          <Link key={c.id} href={`/contratos/${c.id}`}
            className="grid items-center px-4 py-3.5 border-b border-line hover:bg-surface-alt transition-colors text-sm"
            style={{gridTemplateColumns:'80px 130px 1.3fr 1.2fr 110px 110px'}}>
            <span className="font-mono text-xs text-ink-soft">{c.numero}</span>
            <span className="text-xs capitalize">{c.tipo.replace(/_/g,' ')}</span>
            <span className="font-semibold">{(c.imovel as any)?.logradouro}, {(c.imovel as any)?.numero}</span>
            <span className="text-ink-soft">{(c.proprietario as any)?.nome} → {(c.inquilino as any)?.nome}</span>
            <span className="text-xs text-ink-soft">desde {formatDate(c.data_inicio)}</span>
            <StatusContratoBadge status={c.status} />
          </Link>
        ))}
        {!(contratos ?? []).length && <p className="text-sm text-ink-faint text-center py-10">Nenhum contrato cadastrado ainda.</p>}
      </div>
    </div>
  )
}
