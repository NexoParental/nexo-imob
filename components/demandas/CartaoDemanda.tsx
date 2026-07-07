import Link from 'next/link'
import { StatusBadge, UrgenciaBadge } from '@/components/ui'
import { formatDateShort, isPrazoProximo, LABELS_TIPO_DEMANDA, garantiaLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Demanda } from '@/lib/types'

export default function CartaoDemanda({ demanda }: { demanda: Demanda }) {
  const contrato = demanda.contrato
  const proprietario = contrato?.proprietario?.nome ?? '—'
  const inquilino = contrato?.inquilino?.nome ?? '—'
  const tipo_garantia = contrato?.tipo_garantia
  const fiador = contrato?.fiador?.nome
  const garantia = tipo_garantia ? garantiaLabel(tipo_garantia, contrato?.garantia_descricao, fiador) : undefined
  const endereco = contrato?.imovel
    ? `${contrato.imovel.logradouro}, ${contrato.imovel.numero}${contrato.imovel.complemento ? `, ${contrato.imovel.complemento}` : ''}`
    : '—'

  return (
    <Link
      href={`/demandas/${demanda.id}`}
      className="grid items-center px-4 py-3.5 border-b border-line hover:bg-surface-alt transition-colors"
      style={{ gridTemplateColumns: '110px 1fr 90px 130px 90px' }}
    >
      {/* Protocolo */}
      <span className="font-mono text-[12px] text-ink-soft">{demanda.protocolo}</span>

      {/* Caso */}
      <div>
        <div className="font-semibold text-sm text-ink">{proprietario} × {inquilino}</div>
        {garantia && <div className="text-[11.5px] text-accent font-semibold mt-0.5">{garantia}</div>}
        <div className="text-[12.5px] text-ink-soft font-medium mt-0.5">{LABELS_TIPO_DEMANDA[demanda.tipo]}</div>
        <div className="text-[11px] text-ink-faint mt-0.5">
          {demanda.campos_extras && typeof demanda.campos_extras === 'object' && 'descricao' in demanda.campos_extras
            ? String(demanda.campos_extras.descricao) + ' · '
            : ''}
          Contrato nº {contrato?.numero ?? '—'}
        </div>
        <div className="text-[11px] text-ink-faint">{endereco}</div>
      </div>

      {/* Urgência */}
      <UrgenciaBadge urgencia={demanda.urgencia} />

      {/* Status */}
      <StatusBadge status={demanda.status} />

      {/* Prazo */}
      <span className={cn('text-sm font-medium', isPrazoProximo(demanda.prazo ?? undefined) ? 'text-urgent font-semibold' : 'text-ink-soft')}>
        {demanda.prazo ? formatDateShort(demanda.prazo) : '—'}
      </span>
    </Link>
  )
}
