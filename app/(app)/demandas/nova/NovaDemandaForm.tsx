'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Textarea, Select, UploadZone, FieldNote, ExplainBox, SectionTitle, Card } from '@/components/ui'
import { garantiaLabel } from '@/lib/utils'
import type { TipoDemanda, UrgenciaDemanda, TipoGarantia } from '@/lib/types'

const TIPOS_DEMANDA = [
  { value: 'cobranca', label: 'Cobrança' },
  { value: 'notificacao', label: 'Notificação extrajudicial' },
  { value: 'despejo', label: 'Ação de despejo' },
  { value: 'contratual', label: 'Contratual (elaboração/revisão)' },
  { value: 'condominial', label: 'Condominial / seguro-fiança' },
  { value: 'distrato', label: 'Distrato / rescisão' },
]

interface Props {
  contratos: any[]
  userId: string
  organizationId: string
}

export default function NovaDemandaForm({ contratos, userId, organizationId }: Props) {
  const [contratoId, setContratoId] = useState(contratos[0]?.id ?? '')
  const [tipo, setTipo] = useState<TipoDemanda>('cobranca')
  const [urgencia, setUrgencia] = useState<UrgenciaDemanda>('media')
  const [prazo, setPrazo] = useState('')
  const [extras, setExtras] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const contrato = contratos.find(c => c.id === contratoId)
  const garantia = contrato
    ? garantiaLabel(contrato.tipo_garantia as TipoGarantia, contrato.garantia_descricao, contrato.fiador?.nome)
    : '—'

  function setExtra(key: string, value: string) {
    setExtras(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contratoId) return
    setLoading(true)
    setError('')
    const sb = createClient()

    try {
      const { data: demanda, error: dErr } = await sb.from('demandas').insert({
        organization_id: organizationId,
        contrato_id: contratoId,
        tipo,
        urgencia,
        prazo: prazo || null,
        aberta_por: userId,
        campos_extras: extras,
        status: 'aberta',
      }).select().single()

      if (dErr) throw dErr

      if (files) {
        for (const file of Array.from(files)) {
          const path = `${demanda.id}/${Date.now()}-${file.name}`
          const { error: upErr } = await sb.storage.from('documentos').upload(path, file)
          if (!upErr) {
            await sb.from('documentos').insert({
              demanda_id: demanda.id,
              nome: file.name,
              storage_path: path,
              mime_type: file.type,
              tamanho_bytes: file.size,
              uploaded_by: userId,
            })
          }
        }
      }

      // Mensagem inicial automática
      await sb.from('mensagens').insert({
        demanda_id: demanda.id,
        autor_id: userId,
        conteudo: `Demanda aberta: ${tipo}. ${extras.descricao ?? ''}`,
        tipo: 'mensagem',
      })

      router.push(`/demandas/${demanda.id}`)
    } catch {
      setError('Erro ao criar demanda. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">Nova demanda</div>
          <h1 className="text-2xl font-bold tracking-tight">Encaminhar ao jurídico</h1>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
      </div>

      <ExplainBox>
        <strong>Por que o formulário muda:</strong> cada tipo de demanda precisa de informações diferentes.
        Assim o Dr. José Eduardo pode começar a trabalhar sem precisar pedir nada de volta.
      </ExplainBox>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card className="flex flex-col gap-4">

          {/* Contrato */}
          <div>
            <Select
              label="Contrato vinculado"
              value={contratoId}
              onChange={e => setContratoId(e.target.value)}
              options={contratos.map(c => ({
                value: c.id,
                label: `Nº ${c.numero} — ${c.imovel?.logradouro}, ${c.imovel?.numero} (${c.proprietario?.nome} → ${c.inquilino?.nome})`
              }))}
            />
            <FieldNote>Puxa automaticamente o imóvel e as partes — é por isso que o contrato precisa existir antes.</FieldNote>
            {contrato && (
              <div className="mt-2 bg-surface-alt border border-line p-3 text-xs">
                <div className="font-bold text-[10px] uppercase tracking-wider text-accent mb-2">Dados do contrato</div>
                <div className="grid grid-cols-2 gap-1 text-ink-soft">
                  <span>Imóvel</span><span className="font-semibold text-ink">{contrato.imovel?.logradouro}, {contrato.imovel?.numero}</span>
                  <span>Proprietário</span><span className="font-semibold text-ink">{contrato.proprietario?.nome}</span>
                  <span>Inquilino</span><span className="font-semibold text-ink">{contrato.inquilino?.nome}</span>
                  <span>Garantia</span><span className="font-semibold text-ink">{garantia}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Tipo de demanda"
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoDemanda)}
                options={TIPOS_DEMANDA}
              />
              <FieldNote>Define quais campos aparecem abaixo.</FieldNote>
            </div>
            <div>
              <Select
                label="Urgência"
                value={urgencia}
                onChange={e => setUrgencia(e.target.value as UrgenciaDemanda)}
                options={[{value:'alta',label:'Alta'},{value:'media',label:'Média'},{value:'baixa',label:'Baixa'}]}
              />
              <FieldNote>Ordena a fila do escritório.</FieldNote>
            </div>
          </div>

          <Input label="Prazo esperado" type="date" value={prazo} onChange={e => setPrazo(e.target.value)} />

          {/* Campos dinâmicos por tipo */}
          <SectionTitle>Detalhes da demanda</SectionTitle>

          {tipo === 'cobranca' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input label="Valor total em aberto (R$)" value={extras.valor ?? ''} onChange={e => setExtra('valor', e.target.value)} placeholder="Ex.: 8.400,00" />
                  <FieldNote>Base para o cálculo de qualquer cobrança — sem isso o advogado não sabe o valor da causa.</FieldNote>
                </div>
                <div>
                  <Input label="Meses em atraso" value={extras.meses ?? ''} onChange={e => setExtra('meses', e.target.value)} placeholder="Ex.: 3" />
                  <FieldNote>Indica se cabe negociação amigável ou já justifica ação.</FieldNote>
                </div>
              </div>
              <Textarea label="Tentativas de contato" value={extras.descricao ?? ''} onChange={e => setExtra('descricao', e.target.value)} placeholder="O que já foi tentado com o inquilino e/ou fiador" />
            </>
          )}

          {tipo === 'notificacao' && (
            <>
              <Select label="Motivo" value={extras.motivo ?? ''} onChange={e => setExtra('motivo', e.target.value)}
                options={[{value:'',label:'Selecione...'},{value:'atraso',label:'Atraso no pagamento'},{value:'descumprimento',label:'Descumprimento contratual'},{value:'rescisao',label:'Aviso prévio de rescisão'}]} />
              <FieldNote>Muda o texto legal da notificação — cada motivo tem base jurídica e prazo diferentes.</FieldNote>
              <Input label="Prazo desejado para resposta" type="date" value={extras.prazo_resposta ?? ''} onChange={e => setExtra('prazo_resposta', e.target.value)} />
            </>
          )}

          {tipo === 'despejo' && (
            <>
              <Select label="Notificações anteriores já enviadas?" value={extras.notificacoes ?? ''} onChange={e => setExtra('notificacoes', e.target.value)}
                options={[{value:'sim',label:'Sim, anexadas abaixo'},{value:'nao',label:'Não'}]} />
              <FieldNote>Uma ação de despejo é mais sólida quando já existe notificação prévia.</FieldNote>
              <Textarea label="Histórico de inadimplência" value={extras.descricao ?? ''} onChange={e => setExtra('descricao', e.target.value)} placeholder="Resumo dos meses em aberto e tentativas de acordo" rows={4} />
              <FieldNote>Vira a base fática da petição inicial — quanto mais completo, menos idas e vindas.</FieldNote>
            </>
          )}

          {tipo === 'contratual' && (
            <>
              <Select label="O que precisa ser feito" value={extras.acao ?? ''} onChange={e => setExtra('acao', e.target.value)}
                options={[{value:'minuta',label:'Elaborar nova minuta'},{value:'revisao',label:'Revisar contrato existente'},{value:'parecer',label:'Parecer sobre cláusula específica'}]} />
              <Textarea label="Condições já negociadas" value={extras.descricao ?? ''} onChange={e => setExtra('descricao', e.target.value)} placeholder="Valores, prazos, garantias já negociadas entre as partes" />
              <FieldNote>O advogado formaliza o que foi negociado — não decide valores comerciais.</FieldNote>
            </>
          )}

          {tipo === 'condominial' && (
            <>
              <Select label="Origem" value={extras.origem ?? ''} onChange={e => setExtra('origem', e.target.value)}
                options={[{value:'condominio',label:'Notificação do condomínio'},{value:'seguro',label:'Sinistro de seguro-fiança'}]} />
              <Textarea label="Resumo da situação" value={extras.descricao ?? ''} onChange={e => setExtra('descricao', e.target.value)} placeholder="O que o condomínio ou a seguradora alega" />
            </>
          )}

          {tipo === 'distrato' && (
            <>
              <Input label="Motivo do distrato" value={extras.motivo ?? ''} onChange={e => setExtra('motivo', e.target.value)} placeholder="Ex.: pedido do inquilino, venda do imóvel" />
              <Textarea label="Situação de caução e pagamentos" value={extras.descricao ?? ''} onChange={e => setExtra('descricao', e.target.value)} placeholder="Há valores retidos ou pendentes?" />
              <FieldNote>É o ponto que mais gera disputa — o termo precisa deixar isso resolvido por escrito.</FieldNote>
            </>
          )}

          <SectionTitle>Documentos desta demanda</SectionTitle>
          <UploadZone label="Anexar documentos" onChange={setFiles} />
          <FieldNote>Documentos do imóvel e das partes já estão no cadastro do contrato — aqui é só o que é específico deste caso.</FieldNote>

          {error && <p className="text-xs text-urgent">{error}</p>}

          <Button type="submit" variant="accent" loading={loading} className="mt-2">
            Enviar ao jurídico
          </Button>
        </Card>
      </form>
    </div>
  )
}
