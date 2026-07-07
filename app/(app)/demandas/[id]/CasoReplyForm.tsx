'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Textarea, Select, UploadZone, FieldNote } from '@/components/ui'
import type { StatusDemanda } from '@/lib/types'

const STATUS_OPTIONS = [
  { value: '', label: 'Manter status atual' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'aguardando_doc', label: 'Aguardando documentação' },
  { value: 'protocolado', label: 'Protocolado' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluído' },
]

interface Props {
  demandaId: string
  currentStatus: StatusDemanda
  isAdvogado: boolean
  authorId: string
}

export default function CasoReplyForm({ demandaId, currentStatus, isAdvogado, authorId }: Props) {
  const [conteudo, setConteudo] = useState('')
  const [novoStatus, setNovoStatus] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!conteudo.trim() && !files?.length) return
    setLoading(true)
    setError('')

    const sb = createClient()

    try {
      // 1. Criar mensagem
      const tipo = novoStatus ? 'mudanca_status' : 'mensagem'
      const { data: msg, error: msgErr } = await sb.from('mensagens').insert({
        demanda_id: demandaId,
        autor_id: authorId,
        conteudo: conteudo.trim() || `Status alterado para: ${novoStatus}`,
        tipo,
        status_anterior: novoStatus ? currentStatus : undefined,
        status_novo: novoStatus || undefined,
      }).select().single()

      if (msgErr) throw msgErr

      // 2. Upload de documentos
      if (files) {
        for (const file of Array.from(files)) {
          const path = `${demandaId}/${Date.now()}-${file.name}`
          const { error: upErr } = await sb.storage.from('documentos').upload(path, file)
          if (!upErr) {
            await sb.from('documentos').insert({
              demanda_id: demandaId,
              mensagem_id: msg.id,
              nome: file.name,
              storage_path: path,
              mime_type: file.type,
              tamanho_bytes: file.size,
              uploaded_by: authorId,
            })
          }
        }
      }

      // 3. Atualizar status da demanda
      if (novoStatus) {
        await sb.from('demandas').update({ status: novoStatus, updated_at: new Date().toISOString() }).eq('id', demandaId)
      }

      setConteudo('')
      setNovoStatus('')
      setFiles(null)
      router.refresh()
    } catch (err) {
      setError('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line p-5">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-4">
        {isAdvogado ? 'Responder e atualizar' : 'Responder ao jurídico'}
      </h2>

      <div className="flex flex-col gap-3">
        <Textarea
          label="Mensagem"
          value={conteudo}
          onChange={e => setConteudo(e.target.value)}
          placeholder={isAdvogado
            ? 'Responda, peça documento, atualize o andamento...'
            : 'Responda a uma solicitação, envie informação ou peça um retorno...'}
          rows={4}
        />

        <UploadZone label="Anexar documento" onChange={setFiles} />
        <FieldNote>
          Substitui o anexo em WhatsApp — fica salvo dentro do caso, vinculado a esta mensagem.
        </FieldNote>

        {isAdvogado && (
          <Select
            label="Alterar status"
            value={novoStatus}
            onChange={e => setNovoStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
        )}

        {isAdvogado && (
          <FieldNote>
            Mudar o status aqui já atualiza o painel da Haroldo Lopes — ninguém precisa avisar por fora.
          </FieldNote>
        )}

        {error && <p className="text-xs text-urgent">{error}</p>}

        <Button type="submit" variant={isAdvogado ? 'accent' : 'primary'} loading={loading}>
          {isAdvogado ? 'Enviar e atualizar' : 'Enviar ao jurídico'}
        </Button>
      </div>
    </form>
  )
}
