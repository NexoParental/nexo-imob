'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LABELS_STATUS_DEMANDA } from '@/lib/utils'
import type { StatusDemanda } from '@/lib/types'

interface MensagemData {
  id: string
  tipo: string
  conteudo: string
  created_at: string
  autor_nome: string
  autor_role: string
  status_novo?: string | null
  excluido?: boolean
  excluido_em?: string | null
  excluido_por_nome?: string | null
  leituras: Array<{ id: string; nome: string }>
}

function fmtDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function MensagemItem({
  msg,
  currentUserId,
}: {
  msg: MensagemData
  currentUserId: string
}) {
  const foiLida = msg.leituras.length > 0
  const isMudancaStatus = msg.tipo === 'mudanca_status'
  const ehMensagemDoUsuario = msg.autor_nome && currentUserId // só mostra checkmarks se for do próprio usuário

  // Mensagem excluída — mostrar rastro
  if (msg.excluido) {
    return (
      <div className="relative pl-5 pb-5 border-l border-line ml-1.5 last:border-transparent last:pb-0">
        <div className="absolute -left-[5px] top-0.5 w-2.5 h-2.5 rounded-full bg-line border-2 border-surface" />
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-sm text-ink-faint">{msg.autor_nome}</span>
          <span className="text-[11px] text-ink-faint">{fmtDataHora(msg.created_at)}</span>
        </div>
        <p className="text-sm text-ink-faint italic mt-1">
          [mensagem excluída por <strong>{msg.excluido_por_nome}</strong>]
        </p>
      </div>
    )
  }

  return (
    <div className="relative pl-5 pb-5 border-l border-line ml-1.5 last:border-transparent last:pb-0">
      <div className={cn(
        'absolute -left-[5px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface',
        isMudancaStatus ? 'bg-warning' : 'bg-accent'
      )} />

      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-semibold text-sm">{msg.autor_nome}</span>
        <span className="text-[11px] text-ink-faint">{fmtDataHora(msg.created_at)}</span>

        {/* Checkmarks de leitura (só mostra se for mensagem do próprio usuário) */}
        {!isMudancaStatus && ehMensagemDoUsuario && (
          <div className="relative group/checkmarks">
            <span className="text-[11px] text-ink-faint ml-1 cursor-help">
              {foiLida ? '✓✓' : '✓'}
            </span>
            {foiLida && (
              <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-ink text-white text-[10px] rounded opacity-0 group-hover/checkmarks:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Lido por: {msg.leituras.map(l => l.nome).join(', ')}
              </div>
            )}
          </div>
        )}

        {isMudancaStatus && msg.status_novo && (
          <span className="text-[11px] bg-surface-alt px-2 py-0.5 text-ink-soft">
            Status → {LABELS_STATUS_DEMANDA[msg.status_novo as StatusDemanda] ?? msg.status_novo}
          </span>
        )}
      </div>

      <p className="text-sm text-ink-soft mt-1 leading-relaxed">{msg.conteudo}</p>
    </div>
  )
}
