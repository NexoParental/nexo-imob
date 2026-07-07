'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Select, UploadZone, FieldNote, ExplainBox, SectionTitle, Card } from '@/components/ui'

interface Props { organizationId: string; pessoa?: any }

export default function PessoaForm({ organizationId, pessoa }: Props) {
  const editing = !!pessoa
  const [f, setF] = useState({
    tipo_pessoa: pessoa?.tipo_pessoa ?? 'fisica',
    papel_principal: pessoa?.papel_principal ?? 'inquilino',
    nome: pessoa?.nome ?? '', cpf: pessoa?.cpf ?? '', cnpj: pessoa?.cnpj ?? '',
    rg: pessoa?.rg ?? '', orgao_emissor: pessoa?.orgao_emissor ?? '',
    estado_civil: pessoa?.estado_civil ?? '', profissao: pessoa?.profissao ?? '',
    representante_legal: pessoa?.representante_legal ?? '',
    telefone: pessoa?.telefone ?? '', email: pessoa?.email ?? '', endereco: pessoa?.endereco ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({...p, [k]: e.target.value}))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const sb = createClient()
    const payload = { ...f, organization_id: organizationId }
    const { error: err } = editing
      ? await sb.from('pessoas').update(payload).eq('id', pessoa.id)
      : await sb.from('pessoas').insert(payload)
    if (err) { setError(err.message); setLoading(false) }
    else router.push('/pessoas')
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-5 pb-4 border-b border-line gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">Cadastros · Partes</div>
          <h1 className="text-2xl font-bold tracking-tight">{editing ? 'Editar parte' : 'Cadastrar parte'}</h1>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Voltar</Button>
      </div>
      <ExplainBox>
        O <strong>papel</strong> escolhido é o mais comum desta parte — ela pode aparecer em outro papel em outros contratos sem precisar ser recadastrada.
      </ExplainBox>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select label="Pessoa física ou jurídica" value={f.tipo_pessoa} onChange={set('tipo_pessoa')} options={[{value:'fisica',label:'Física'},{value:'juridica',label:'Jurídica'}]} />
            </div>
            <div>
              <Select label="Papel mais comum" value={f.papel_principal} onChange={set('papel_principal')} options={[{value:'proprietario',label:'Proprietário'},{value:'inquilino',label:'Inquilino'},{value:'comprador',label:'Comprador'},{value:'fiador',label:'Fiador'}]} />
              <FieldNote>Usado só para organizar a lista — não trava a um único papel.</FieldNote>
            </div>
          </div>

          <Input label="Nome completo / Razão social" value={f.nome} onChange={set('nome')} required placeholder="Ex.: Marcos Prado" />

          {f.tipo_pessoa === 'fisica' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input label="CPF" value={f.cpf} onChange={set('cpf')} placeholder="000.000.000-00" />
                  <FieldNote>Obrigatório para qualquer contrato ou peça jurídica.</FieldNote>
                </div>
                <Input label="RG / órgão emissor" value={f.rg} onChange={set('rg')} placeholder="Ex.: 34.221.900-1 SSP/SP" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select label="Estado civil" value={f.estado_civil} onChange={set('estado_civil')} options={[{value:'',label:'Selecione...'},{value:'solteiro',label:'Solteiro(a)'},{value:'casado',label:'Casado(a)'},{value:'uniao_estavel',label:'União estável'},{value:'divorciado',label:'Divorciado(a)'},{value:'viuvo',label:'Viúvo(a)'}]} />
                  <FieldNote>Pode exigir a assinatura do cônjuge no contrato.</FieldNote>
                </div>
                <Input label="Profissão" value={f.profissao} onChange={set('profissao')} placeholder="Ex.: Comerciante" />
              </div>
            </>
          ) : (
            <div>
              <Input label="CNPJ" value={f.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0001-00" />
              <Input label="Representante legal (nome e CPF)" value={f.representante_legal} onChange={set('representante_legal')} placeholder="Quem assina pela empresa" />
              <FieldNote>É essa pessoa que precisa assinar contratos e receber notificações.</FieldNote>
            </div>
          )}

          <SectionTitle>Contato</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefone / WhatsApp" value={f.telefone} onChange={set('telefone')} placeholder="(11) 90000-0000" />
            <Input label="E-mail" value={f.email} onChange={set('email')} type="email" placeholder="nome@email.com" />
          </div>
          <div>
            <Input label="Endereço atual (para correspondência)" value={f.endereco} onChange={set('endereco')} placeholder="Rua, número, cidade — para onde enviar notificações" />
            <FieldNote>Pode ser diferente do imóvel alugado — é para onde uma notificação extrajudicial precisa ir.</FieldNote>
          </div>

          <SectionTitle>Documentos</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <UploadZone label="RG e CPF (ou CNPJ)" />
            <UploadZone label="Comprovante de residência (≤90 dias)" />
          </div>

          {error && <p className="text-xs text-urgent">{error}</p>}
          <Button type="submit" variant="accent" loading={loading}>{editing ? 'Salvar alterações' : 'Salvar pessoa'}</Button>
        </Card>
      </form>
    </div>
  )
}
