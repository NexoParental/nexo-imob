'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Select, UploadZone, FieldNote, ExplainBox, SectionTitle, Card } from '@/components/ui'

interface Props { pessoas: any[]; organizationId: string; imovel?: any }

export default function ImovelForm({ pessoas, organizationId, imovel }: Props) {
  const editing = !!imovel
  const [f, setF] = useState({
    logradouro: imovel?.logradouro ?? '', numero: imovel?.numero ?? '', complemento: imovel?.complemento ?? '',
    bairro: imovel?.bairro ?? '', cidade: imovel?.cidade ?? 'São Paulo', uf: imovel?.uf ?? 'SP', cep: imovel?.cep ?? '',
    tipo: imovel?.tipo ?? 'apartamento', matricula: imovel?.matricula ?? '', cartorio: imovel?.cartorio ?? '',
    inscricao_municipal: imovel?.inscricao_municipal ?? '', proprietario_id: imovel?.proprietario_id ?? '',
    condominio_nome: imovel?.condominio_nome ?? '', condominio_contato: imovel?.condominio_contato ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({...p, [k]: e.target.value}))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const sb = createClient()
    const payload = { ...f, organization_id: organizationId, proprietario_id: f.proprietario_id || null }
    const { error: err } = editing
      ? await sb.from('imoveis').update(payload).eq('id', imovel.id)
      : await sb.from('imoveis').insert(payload)
    if (err) { setError(err.message); setLoading(false) }
    else router.push('/imoveis')
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">Cadastros · Imóveis</div>
          <h1 className="text-2xl font-bold tracking-tight">{editing ? 'Editar imóvel' : 'Cadastrar imóvel'}</h1>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Voltar</Button>
      </div>
      <ExplainBox>
        Preencha aqui apenas o que é <strong>do imóvel em si</strong>. Quem mora e as condições de cada negócio ficam no <strong>Contrato</strong>, porque um mesmo imóvel pode ter vários contratos ao longo do tempo.
      </ExplainBox>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card className="flex flex-col gap-4">
          <SectionTitle>Endereço</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Logradouro" value={f.logradouro} onChange={set('logradouro')} required placeholder="Ex.: Rua das Acácias" />
            <Input label="Número / complemento" value={f.numero} onChange={set('numero')} required placeholder="Ex.: 120" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Bairro" value={f.bairro} onChange={set('bairro')} required />
            <Input label="Cidade" value={f.cidade} onChange={set('cidade')} required />
            <div className="grid grid-cols-2 gap-2">
              <Input label="UF" value={f.uf} onChange={set('uf')} maxLength={2} />
              <Input label="CEP" value={f.cep} onChange={set('cep')} />
            </div>
          </div>

          <SectionTitle>Identificação legal</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select label="Tipo" value={f.tipo} onChange={set('tipo')} options={[{value:'apartamento',label:'Apartamento residencial'},{value:'casa',label:'Casa'},{value:'comercial',label:'Sala/loja comercial'},{value:'terreno',label:'Terreno'}]} />
              <FieldNote>Muda quais documentos e regras se aplicam — comercial e residencial seguem leis diferentes.</FieldNote>
            </div>
            <div>
              <Input label="Nº da matrícula" value={f.matricula} onChange={set('matricula')} placeholder="Ex.: 78.421" />
              <FieldNote>O "RG" do imóvel no cartório — o jurídico usa em qualquer ação.</FieldNote>
            </div>
          </div>
          <Input label="Cartório de registro de imóveis" value={f.cartorio} onChange={set('cartorio')} placeholder="Ex.: 9º Cartório de Registro de Imóveis de São Paulo" />
          <Input label="Inscrição municipal / IPTU" value={f.inscricao_municipal} onChange={set('inscricao_municipal')} placeholder="Ex.: 123.456.0001-7" />
          <div>
            <Select label="Proprietário atual" value={f.proprietario_id} onChange={set('proprietario_id')}
              options={[{value:'',label:'Selecione...'},...pessoas.map(p => ({value:p.id,label:p.nome}))]} />
            <FieldNote>Puxado do cadastro de Pessoas — se não existe, cadastre primeiro.</FieldNote>
          </div>
          <Input label="Condomínio (nome e contato do síndico)" value={f.condominio_nome} onChange={set('condominio_nome')} placeholder="Ex.: Edifício Jasmim — síndico João, (11) 9xxxx-xxxx" />

          <SectionTitle>Documentos do imóvel</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <UploadZone label="Matrícula atualizada (≤30 dias)" />
            <UploadZone label="Certidão de ônus / IPTU" />
          </div>

          {error && <p className="text-xs text-urgent">{error}</p>}
          <Button type="submit" variant="accent" loading={loading}>{editing ? 'Salvar alterações' : 'Salvar imóvel'}</Button>
        </Card>
      </form>
    </div>
  )
}
