import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const PAPEL_LABEL: Record<string, string> = { proprietario: 'Proprietário', inquilino: 'Inquilino', comprador: 'Comprador', fiador: 'Fiador' }
const PAPEL_STYLE: Record<string, string> = {
  proprietario: 'bg-blue-50 text-blue-700', inquilino: 'bg-success-bg text-success',
  comprador: 'bg-warning-bg text-warning', fiador: 'bg-purple-50 text-purple-700',
}

export default async function PessoasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  const { data: pessoas } = await supabase.from('pessoas').select('*').eq('organization_id', profile!.organization_id).order('nome')

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">Cadastros</div>
          <h1 className="text-2xl font-bold tracking-tight">Partes</h1>
        </div>
        <Link href="/pessoas/nova" className="bg-accent text-white text-sm font-semibold px-4 py-2.5 hover:bg-accent-deep transition-colors">
          + Nova parte
        </Link>
      </div>
      <div className="bg-surface border border-line overflow-hidden">
        <div className="grid px-4 py-2 bg-surface-alt text-[10.5px] uppercase tracking-widest text-ink-faint font-semibold" style={{gridTemplateColumns:'1.3fr 130px 1fr 1fr 80px'}}>
          <div>Nome</div><div>Papel</div><div>CPF/CNPJ</div><div>Contato</div><div>Contratos</div>
        </div>
        {(pessoas ?? []).map(p => (
          <Link key={p.id} href={`/pessoas/${p.id}`}
            className="grid items-center px-4 py-3 border-b border-line hover:bg-surface-alt transition-colors text-sm"
            style={{gridTemplateColumns:'1.3fr 130px 1fr 1fr 80px'}}>
            <div className="font-semibold">{p.nome}<div className="text-xs text-ink-faint font-normal capitalize">{p.tipo_pessoa}</div></div>
            <div><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PAPEL_STYLE[p.papel_principal] ?? 'bg-surface-alt text-ink-soft'}`}>{PAPEL_LABEL[p.papel_principal] ?? p.papel_principal}</span></div>
            <div className="font-mono text-xs">{p.cpf ?? p.cnpj ?? '—'}</div>
            <div className="text-xs text-ink-soft">{p.telefone ?? p.email ?? '—'}</div>
            <div className="text-xs text-ink-faint">Ver →</div>
          </Link>
        ))}
        {!(pessoas ?? []).length && <p className="text-sm text-ink-faint text-center py-10">Nenhuma pessoa cadastrada ainda.</p>}
      </div>
    </div>
  )
}
