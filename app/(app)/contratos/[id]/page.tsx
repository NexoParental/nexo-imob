import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { KV, Card, StatusContratoBadge, StatusBadge, DocChip } from '@/components/ui'
import { formatDate, formatCurrency, garantiaLabel, LABELS_TIPO_DEMANDA } from '@/lib/utils'
import ContratoForm from '../ContratoForm'
import AnalisarContrato from './AnalisarContrato'
import EnviarAssinatura from './EnviarAssinatura'

export default async function ContratoFichaPage({ params, searchParams }: { params: Promise<{id:string}>; searchParams: Promise<{editar?:string}> }) {
  const { id } = await params
  const { editar } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()

  const { data: contrato } = await supabase
    .from('contratos')
    .select(`*, imovel:imoveis(*), proprietario:pessoas!contratos_proprietario_id_fkey(*), inquilino:pessoas!contratos_inquilino_id_fkey(*), fiador:pessoas!contratos_fiador_id_fkey(*)`)
    .eq('id', id).single()
  if (!contrato) notFound()

  if (editar) {
    const [{ data: imoveis }, { data: pessoas }] = await Promise.all([
      supabase.from('imoveis').select('id, logradouro, numero, bairro').eq('organization_id', profile!.organization_id),
      supabase.from('pessoas').select('id, nome, papel_principal').eq('organization_id', profile!.organization_id),
    ])
    return <ContratoForm contrato={contrato} imoveis={imoveis ?? []} pessoas={pessoas ?? []} organizationId={profile!.organization_id} />
  }

  const { data: demandas } = await supabase.from('demandas').select('id, protocolo, tipo, status, prazo').eq('contrato_id', id).order('created_at', {ascending:false})
  const { data: documentos } = await supabase.from('documentos').select('*').eq('contrato_id', id)
  const im = contrato.imovel as any
  const garantia = garantiaLabel(contrato.tipo_garantia, contrato.garantia_descricao, (contrato.fiador as any)?.nome)

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[11px] text-ink-soft mb-1">Contrato nº {contrato.numero}</div>
          <h1 className="text-2xl font-bold tracking-tight capitalize">{contrato.tipo.replace(/_/g,' ')} — {im?.logradouro}, {im?.numero}</h1>
          <p className="text-sm text-ink-soft">Ativo desde {formatDate(contrato.data_inicio)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/contratos/${id}?editar=1`} className="text-sm border border-line px-3 py-2 hover:border-ink-faint transition-colors">Editar</Link>
          <Link href="/contratos" className="text-sm border border-line px-3 py-2 hover:border-ink-faint transition-colors">← Voltar</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">
        <div className="flex flex-col gap-4">
          <Card>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Imóvel</h3>
            <KV label="Endereço" value={`${im?.logradouro}, ${im?.numero}${im?.complemento ? `, ${im.complemento}` : ''}`} />
            <KV label="Bairro / cidade" value={`${im?.bairro} — ${im?.cidade}/${im?.uf}`} />
            <KV label="Matrícula" value={<span className="font-mono">{im?.matricula ?? '—'}</span>} />
            <KV label="Cartório" value={im?.cartorio ?? '—'} />
          </Card>
          <Card>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Partes</h3>
            <KV label="Proprietário" value={(contrato.proprietario as any)?.nome ?? '—'} />
            <KV label="Inquilino" value={(contrato.inquilino as any)?.nome ?? '—'} />
            <KV label="Garantia" value={garantia} />
          </Card>
          <Card>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Condições</h3>
            <KV label="Início" value={formatDate(contrato.data_inicio)} />
            <KV label="Prazo" value={contrato.prazo_meses ? `${contrato.prazo_meses} meses` : '—'} />
            <KV label="Valor" value={formatCurrency(contrato.valor)} />
            <KV label="Reajuste" value={contrato.indice_reajuste ?? '—'} />
            <KV label="Status" value={<StatusContratoBadge status={contrato.status} />} />
          </Card>
          {(documentos ?? []).length > 0 && (
            <Card>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Documentos</h3>
              <div className="flex flex-wrap gap-1.5">{documentos!.map(d => <DocChip key={d.id} nome={d.nome} />)}</div>
            </Card>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <AnalisarContrato contratoId={id} />
          <EnviarAssinatura contratoId={id} />
          <Card>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Demandas jurídicas</h3>
            {(demandas ?? []).map(d => (
              <Link key={d.id} href={`/demandas/${d.id}`} className="flex items-center justify-between py-2 border-b border-line last:border-b-0 hover:text-accent text-sm">
                <div>
                  <span className="font-mono text-xs text-ink-soft mr-2">{d.protocolo}</span>
                  {LABELS_TIPO_DEMANDA[d.tipo as import('@/lib/types').TipoDemanda]}
                </div>
                <StatusBadge status={d.status as any} />
              </Link>
            ))}
            {!(demandas ?? []).length && <p className="text-sm text-ink-faint">Nenhuma demanda ainda.</p>}
            <Link href={`/demandas/nova?contrato=${id}`} className="block mt-3 text-center text-xs border border-line px-3 py-2 hover:border-ink-faint transition-colors">
              + Abrir demanda para este contrato
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
