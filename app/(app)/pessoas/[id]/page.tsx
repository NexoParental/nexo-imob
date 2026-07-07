import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { KV, Card } from '@/components/ui'
import PessoaForm from '../PessoaForm'

export default async function PessoaFichaPage({ params, searchParams }: { params: Promise<{id:string}>; searchParams: Promise<{editar?:string}> }) {
  const { id } = await params
  const { editar } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()

  const { data: pessoa } = await supabase.from('pessoas').select('*').eq('id', id).single()
  if (!pessoa) notFound()

  if (editar) return <PessoaForm pessoa={pessoa} organizationId={profile!.organization_id} />

  const { data: contratos } = await supabase.from('contratos')
    .select('numero, tipo, status, imovel:imoveis(logradouro, numero)')
    .or(`proprietario_id.eq.${id},inquilino_id.eq.${id},fiador_id.eq.${id}`)

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{pessoa.nome}</h1>
          <p className="text-sm text-ink-soft capitalize">{pessoa.tipo_pessoa} · {pessoa.papel_principal}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/pessoas/${id}?editar=1`} className="text-sm border border-line px-3 py-2 hover:border-ink-faint transition-colors">Editar</Link>
          <Link href="/pessoas" className="text-sm border border-line px-3 py-2 hover:border-ink-faint transition-colors">← Voltar</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Dados</h3>
          <KV label="CPF" value={<span className="font-mono">{pessoa.cpf ?? '—'}</span>} />
          {pessoa.cnpj && <KV label="CNPJ" value={<span className="font-mono">{pessoa.cnpj}</span>} />}
          {pessoa.rg && <KV label="RG" value={pessoa.rg} />}
          {pessoa.estado_civil && <KV label="Estado civil" value={pessoa.estado_civil} />}
          {pessoa.profissao && <KV label="Profissão" value={pessoa.profissao} />}
          <KV label="Telefone" value={pessoa.telefone ?? '—'} />
          <KV label="E-mail" value={pessoa.email ?? '—'} />
          {pessoa.endereco && <KV label="Endereço" value={pessoa.endereco} />}
        </Card>
        <Card>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Contratos vinculados</h3>
          {(contratos ?? []).map(c => (
            <div key={c.numero} className="flex justify-between py-2 border-b border-line last:border-b-0 text-sm">
              <span>Nº {c.numero} — {(c.imovel as any)?.logradouro}</span>
              <span className="capitalize text-ink-faint text-xs">{c.status}</span>
            </div>
          ))}
          {!(contratos ?? []).length && <p className="text-sm text-ink-faint">Nenhum contrato.</p>}
        </Card>
      </div>
    </div>
  )
}
