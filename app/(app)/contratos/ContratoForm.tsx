'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Select, UploadZone, FieldNote, ExplainBox, SectionTitle, Card } from '@/components/ui'

interface Props { imoveis: any[]; pessoas: any[]; organizationId: string; contrato?: any; defaultImovelId?: string }

export default function ContratoForm({ imoveis, pessoas, organizationId, contrato, defaultImovelId }: Props) {
  const editing = !!contrato
  const [f, setF] = useState({
    tipo: contrato?.tipo ?? 'locacao_residencial',
    imovel_id: contrato?.imovel_id ?? defaultImovelId ?? '',
    proprietario_id: contrato?.proprietario_id ?? '',
    inquilino_id: contrato?.inquilino_id ?? '',
    tipo_garantia: contrato?.tipo_garantia ?? 'fiador',
    fiador_id: contrato?.fiador_id ?? '',
    garantia_descricao: contrato?.garantia_descricao ?? '',
    data_inicio: contrato?.data_inicio ?? '',
    prazo_meses: contrato?.prazo_meses ?? '',
    valor: contrato?.valor ?? '',
    indice_reajuste: contrato?.indice_reajuste ?? 'IGP-M',
    status: contrato?.status ?? 'ativo',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({...p, [k]: e.target.value}))

  // Todas as partes ficam disponíveis em qualquer papel do contrato
  const todasPartes = pessoas.map(p => ({ value: p.id, label: p.nome }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const sb = createClient()
    const payload = { ...f, organization_id: organizationId, prazo_meses: f.prazo_meses ? Number(f.prazo_meses) : null, valor: Number(f.valor), fiador_id: f.fiador_id || null, garantia_descricao: f.garantia_descricao || null }
    const { error: err } = editing
      ? await sb.from('contratos').update(payload).eq('id', contrato.id)
      : await sb.from('contratos').insert(payload)
    if (err) { setError(err.message); setLoading(false) }
    else router.push('/contratos')
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">Cadastros · Contratos</div>
          <h1 className="text-2xl font-bold tracking-tight">{editing ? 'Editar contrato' : 'Cadastrar contrato'}</h1>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Voltar</Button>
      </div>
      <ExplainBox>
        Ordem obrigatória: <strong>1. Partes</strong> → <strong>2. Imóveis</strong> → <strong>3. Contratos</strong>. O imóvel e as partes precisam estar cadastrados antes — sem eles, não é possível criar um contrato válido para ações jurídicas.
      </ExplainBox>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select label="Tipo de contrato" value={f.tipo} onChange={set('tipo')} options={[{value:'locacao_residencial',label:'Locação residencial'},{value:'locacao_comercial',label:'Locação comercial'},{value:'compra_venda',label:'Compra e venda'},{value:'administracao',label:'Administração de carteira'}]} />
              <FieldNote>Define quais cláusulas e leis se aplicam.</FieldNote>
            </div>
            <div>
              <Select label="Imóvel vinculado" value={f.imovel_id} onChange={set('imovel_id')} options={[{value:'',label:'Selecione o imóvel...'},...imoveis.map(im => ({value:im.id,label:`${im.logradouro}, ${im.numero} — ${im.bairro}`}))]} />
              <FieldNote>Cadastre o imóvel primeiro se ele ainda não aparece aqui.</FieldNote>
            </div>
          </div>

          <SectionTitle>Partes do contrato</SectionTitle>
          <ExplainBox>
            Selecione as partes do cadastro de <strong>Partes</strong>. Se alguém não aparece, cadastre primeiro antes de continuar.
          </ExplainBox>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Proprietário" value={f.proprietario_id} onChange={set('proprietario_id')} options={[{value:'',label:'Selecione...'},...todasPartes]} />
            <div>
              <Select label="Inquilino / comprador" value={f.inquilino_id} onChange={set('inquilino_id')} options={[{value:'',label:'Selecione...'},...todasPartes]} />
              <FieldNote>Quem vai nomear em qualquer cobrança, notificação ou ação de despejo.</FieldNote>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select label="Garantia da locação" value={f.tipo_garantia} onChange={set('tipo_garantia')} options={[{value:'fiador',label:'Fiador'},{value:'seguro_fianca',label:'Seguro-fiança'},{value:'caucao',label:'Caução em depósito'},{value:'titulo',label:'Título de capitalização'},{value:'sem_garantia',label:'Sem garantia'}]} />
              <FieldNote>Muda totalmente a estratégia de cobrança.</FieldNote>
            </div>
            {f.tipo_garantia === 'fiador' && (
              <Select label="Fiador" value={f.fiador_id} onChange={set('fiador_id')} options={[{value:'',label:'Selecione...'},...todasPartes]} />
            )}
            {['seguro_fianca','caucao','titulo'].includes(f.tipo_garantia) && (
              <Input label={f.tipo_garantia === 'seguro_fianca' ? 'Seguradora / apólice' : f.tipo_garantia === 'caucao' ? 'Valor em caução (R$)' : 'Instituição / título'} value={f.garantia_descricao} onChange={set('garantia_descricao')} placeholder="Descreva a garantia" />
            )}
          </div>

          <SectionTitle>Condições</SectionTitle>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Data de início" type="date" value={f.data_inicio} onChange={set('data_inicio')} required />
            <Input label="Prazo (meses)" type="number" value={f.prazo_meses} onChange={set('prazo_meses')} placeholder="Ex.: 30" />
            <Input label="Valor mensal (R$)" type="number" step="0.01" value={f.valor} onChange={set('valor')} required placeholder="Ex.: 2800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Índice de reajuste" value={f.indice_reajuste} onChange={set('indice_reajuste')} options={[{value:'IGP-M',label:'IGP-M'},{value:'IPCA',label:'IPCA'},{value:'outro',label:'Outro / negociado'}]} />
            <div>
              <Select label="Status" value={f.status} onChange={set('status')} options={[{value:'ativo',label:'Ativo'},{value:'inadimplente',label:'Inadimplente'},{value:'em_renovacao',label:'Em renovação'},{value:'encerrado',label:'Encerrado'}]} />
              <FieldNote>Ajuda a decidir se é hora de acionar o jurídico.</FieldNote>
            </div>
          </div>

          <SectionTitle>Documentos do contrato</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <UploadZone label="Contrato assinado (todas as páginas)" />
            <UploadZone label="Comprovante da garantia" />
          </div>

          {error && <p className="text-xs text-urgent">{error}</p>}
          <Button type="submit" variant="accent" loading={loading}>{editing ? 'Salvar alterações' : 'Salvar contrato'}</Button>
        </Card>
      </form>
    </div>
  )
}
