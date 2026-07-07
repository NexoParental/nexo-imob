import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { KV, Card, Button } from '@/components/ui'
import ImovelForm from '../ImovelForm'
import ConsultarERPJ from './ConsultarERPJ'

export default async function ImovelFichaPage({ params, searchParams }: { params: Promise<{id: string}>; searchParams: Promise<{editar?: string}> }) {
  const { id } = await params
  const { editar } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()

  const { data: imovel } = await supabase.from('imoveis').select('*, proprietario:pessoas(id, nome)').eq('id', id).single()
  if (!imovel) notFound()

  if (editar) {
    const { data: pessoas } = await supabase.from('pessoas').select('id, nome').eq('organization_id', profile!.organization_id).eq('papel_principal', 'proprietario')
    return <ImovelForm imovel={imovel} pessoas={pessoas ?? []} organizationId={profile!.organization_id} />
  }

  const { data: contratos } = await supabase.from('contratos').select('*, inquilino:pessoas!contratos_inquilino_id_fkey(nome)').eq('imovel_id', id)
  const { data: matriculaConsultada } = await supabase.from('matriculas_consultadas').select('numero_matricula, cartorio').eq('imovel_id', id).maybeSingle()

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[11px] text-ink-soft mb-1">Imóvel · Matrícula {imovel.matricula ?? '—'}</div>
          <h1 className="text-2xl font-bold tracking-tight">{imovel.logradouro}, {imovel.numero}</h1>
          <p className="text-sm text-ink-soft">{imovel.bairro} — {imovel.cidade}/{imovel.uf}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/imoveis/${id}?editar=1`} className="text-sm border border-line px-3 py-2 hover:border-ink-faint transition-colors">Editar</Link>
          <Link href="/imoveis" className="text-sm border border-line px-3 py-2 hover:border-ink-faint transition-colors">← Voltar</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Dados do imóvel</h3>
          <KV label="Tipo" value={imovel.tipo} />
          <KV label="Matrícula" value={<span className="font-mono">{imovel.matricula ?? '—'}</span>} />
          <KV label="Cartório" value={imovel.cartorio ?? '—'} />
          <KV label="IPTU" value={imovel.inscricao_municipal ?? '—'} />
          <KV label="Proprietário" value={(imovel as any).proprietario?.nome ?? '—'} />
          {imovel.condominio_nome && <KV label="Condomínio" value={imovel.condominio_nome} />}
        </Card>
        <Card>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Contratos vinculados</h3>
          {(contratos ?? []).map(c => (
            <Link key={c.id} href={`/contratos/${c.id}`} className="flex justify-between items-center py-2 border-b border-line last:border-b-0 hover:text-accent text-sm">
              <span>Nº {c.numero} — {(c as any).inquilino?.nome}</span>
              <span className="capitalize text-ink-faint text-xs">{c.status}</span>
            </Link>
          ))}
          {!(contratos ?? []).length && <p className="text-sm text-ink-faint">Nenhum contrato ainda.</p>}
          <Link href={`/contratos/novo?imovel=${id}`} className="block mt-3 text-center text-xs border border-line px-3 py-2 hover:border-ink-faint transition-colors">
            + Criar contrato para este imóvel
          </Link>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConsultarERPJ
          imovelId={id}
          matriculaInicial={matriculaConsultada?.numero_matricula ?? imovel.matricula}
          cartorioInicial={matriculaConsultada?.cartorio ?? imovel.cartorio}
        />
      </div>
    </div>
  )
}
