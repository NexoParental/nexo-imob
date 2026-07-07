import { createClient } from '@/lib/supabase/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate, LABELS_TIPO_DEMANDA, garantiaLabel, isPrazoProximo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { StatusBadge, UrgenciaBadge, KV, Card, DocChip } from '@/components/ui'
import CasoReplyForm from './CasoReplyForm'
import MensagemItem from './MensagemItem'
import MarkAsReadEffect from './MarkAsReadEffect'
import GerarDocumento from './GerarDocumento'
import ConsultarCNJ from './ConsultarCNJ'
import type { TipoDemanda } from '@/lib/types'

const admin = adminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function CasoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/login')

  const { data: demanda } = await supabase
    .from('demandas')
    .select(`*,
      contrato:contratos(*, imovel:imoveis(*), proprietario:pessoas!contratos_proprietario_id_fkey(*), inquilino:pessoas!contratos_inquilino_id_fkey(*), fiador:pessoas!contratos_fiador_id_fkey(*)),
      aberta_por_profile:profiles!demandas_aberta_por_fkey(name),
      responsavel_profile:profiles!demandas_responsavel_juridico_fkey(name)
    `)
    .eq('id', id)
    .single()

  if (!demanda) notFound()

  // Buscar mensagens via admin para garantir nomes de todas as orgs
  const { data: mensagensRaw } = await admin
    .from('mensagens')
    .select(`*,
      autor:profiles!mensagens_autor_id_fkey(name, role, id),
      editado_por_profile:profiles!mensagens_editado_por_fkey(name),
      excluido_por_profile:profiles!mensagens_excluido_por_fkey(name),
      leituras:mensagem_leituras(leitor_id, leitor:profiles!mensagem_leituras_leitor_id_fkey(name))
    `)
    .eq('demanda_id', id)
    .order('created_at', { ascending: true })


  const mensagens = (mensagensRaw ?? []).map((m: any) => ({
    id: m.id,
    tipo: m.tipo,
    conteudo: m.conteudo,
    conteudo_original: m.conteudo_original ?? null,
    editado_em: m.editado_em ?? null,
    editado_por_nome: m.editado_por_profile?.name ?? null,
    excluido: m.excluido ?? false,
    excluido_em: m.excluido_em ?? null,
    excluido_por_nome: m.excluido_por_profile?.name ?? null,
    status_novo: m.status_novo ?? null,
    created_at: m.created_at,
    autor_id: m.autor?.id ?? null,
    autor_nome: m.autor?.name ?? '—',
    autor_role: m.autor?.role ?? '',
    leituras: (m.leituras ?? []).map((l: any) => ({ id: l.leitor_id, nome: l.leitor?.name })),
  }))

  const { data: documentos } = await supabase.from('documentos').select('*').eq('demanda_id', id)
  const { data: processoCNJ } = await supabase.from('processos_cnj').select('numero_processo').eq('demanda_id', id).maybeSingle()

  const contrato = demanda.contrato as any
  const imovel = contrato?.imovel
  const garantia = contrato?.tipo_garantia
    ? garantiaLabel(contrato.tipo_garantia, contrato.garantia_descricao, contrato.fiador?.nome)
    : '—'

  const isGestor = profile.role === 'gestor'
  const isAdvogado = profile.role === 'advogado'

  return (
    <div>
      <MarkAsReadEffect
        messageIds={mensagens.map(m => m.id)}
        autorId={isGestor ? undefined : profile.id}
        currentUserId={user.id}
      />
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[11px] text-ink-soft mb-1">
            Protocolo {demanda.protocolo} · Contrato nº {contrato?.numero}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {LABELS_TIPO_DEMANDA[demanda.tipo as TipoDemanda]} — {imovel?.logradouro}, {imovel?.numero}
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            {contrato?.inquilino?.nome} · Locação desde {contrato?.data_inicio ? formatDate(contrato.data_inicio) : '—'}
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-ink-soft border border-line px-3 py-2 hover:border-ink-faint transition-colors">
          ← Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-5">
        {/* Coluna principal: timeline + resposta */}
        <div>
          <div className="bg-surface border border-line p-5 mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-4">Histórico do caso</h2>
            {mensagens.length === 0 && (
              <p className="text-sm text-ink-faint">Nenhuma mensagem ainda. Inicie a comunicação abaixo.</p>
            )}
            {mensagens.map(m => (
              <MensagemItem
                key={m.id}
                msg={m}
                currentUserId={user.id}
              />
            ))}
          </div>

          <CasoReplyForm
            demandaId={demanda.id}
            currentStatus={demanda.status}
            isAdvogado={isAdvogado}
            authorId={user.id}
          />

          {isGestor && <GerarDocumento demandaId={demanda.id} />}
        </div>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-3">
          <Card>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Situação</h3>
            <KV label="Status" value={<StatusBadge status={demanda.status} />} />
            <KV label="Urgência" value={<UrgenciaBadge urgencia={demanda.urgencia} />} />
            <KV label="Prazo" value={
              demanda.prazo
                ? <span className={cn('font-semibold', isPrazoProximo(demanda.prazo) ? 'text-urgent' : '')}>{formatDate(demanda.prazo)}</span>
                : '—'
            } />
            <KV label="Responsável" value={(demanda as any).responsavel_profile?.name ?? 'Não atribuído'} />
          </Card>

          <Card>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Contrato nº {contrato?.numero}</h3>
            <KV label="Imóvel" value={`${imovel?.logradouro}, ${imovel?.numero}`} />
            <KV label="Matrícula" value={<span className="font-mono">{imovel?.matricula ?? '—'}</span>} />
            <KV label="Proprietário" value={contrato?.proprietario?.nome ?? '—'} />
            <KV label="Inquilino" value={contrato?.inquilino?.nome ?? '—'} />
            <KV label="Garantia" value={garantia} />
            <Link href={`/contratos/${contrato?.id}`} className="block mt-3 text-center text-xs border border-line px-3 py-2 hover:border-ink-faint transition-colors">
              Ver ficha completa do contrato →
            </Link>
          </Card>

          {documentos && documentos.length > 0 && (
            <Card>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3">Documentos recebidos</h3>
              <div className="flex flex-wrap gap-1.5">
                {documentos.map(d => <DocChip key={d.id} nome={d.nome} />)}
              </div>
            </Card>
          )}

          <ConsultarCNJ
            demandaId={demanda.id}
            numeroInicial={processoCNJ?.numero_processo}
          />
        </div>
      </div>
    </div>
  )
}
