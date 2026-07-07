'use client'
import { cn } from '@/lib/utils'
import type { StatusDemanda, UrgenciaDemanda, StatusContrato } from '@/lib/types'
import { forwardRef } from 'react'

// ─── Button ───────────────────────────────────────────────
type BtnVariant = 'primary' | 'accent' | 'ghost' | 'danger'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: 'sm' | 'md'
  loading?: boolean
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold transition-colors cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2.5',
        {
          primary: 'bg-ink text-surface hover:bg-[#1a1a1a]',
          accent:  'bg-accent text-white hover:bg-accent-deep',
          ghost:   'bg-transparent text-ink-soft border border-line hover:border-ink-faint hover:text-ink',
          danger:  'bg-urgent text-white hover:bg-[#8a2210]',
        }[variant],
        className
      )}
      {...props}
    >
      {loading ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ─── Input ────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 text-sm bg-paper border border-line text-ink',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
          error && 'border-urgent focus:border-urgent focus:ring-urgent',
          className
        )}
        {...props}
      />
      {hint && !error && <span className="text-[11px] text-ink-faint">{hint}</span>}
      {error && <span className="text-[11px] text-urgent">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</label>}
      <textarea
        ref={ref}
        rows={3}
        className={cn(
          'w-full px-3 py-2.5 text-sm bg-paper border border-line text-ink resize-y',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
          className
        )}
        {...props}
      />
      {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  options: { value: string; label: string }[]
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 text-sm bg-paper border border-line text-ink appearance-none',
          'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
    </div>
  )
)
Select.displayName = 'Select'

// ─── Status badges ────────────────────────────────────────
const STATUS_DEMANDA_STYLE: Record<StatusDemanda, string> = {
  aberta:         'bg-surface-alt text-ink-soft',
  em_analise:     'bg-warning-bg text-warning',
  aguardando_doc: 'bg-purple-50 text-purple-700',
  protocolado:    'bg-blue-50 text-blue-700',
  em_andamento:   'bg-success-bg text-success',
  concluida:      'bg-surface-alt text-ink-faint',
}

const STATUS_DEMANDA_LABEL: Record<StatusDemanda, string> = {
  aberta:         'Aberta',
  em_analise:     'Em análise',
  aguardando_doc: 'Aguardando doc.',
  protocolado:    'Protocolado',
  em_andamento:   'Em andamento',
  concluida:      'Concluído',
}

export function StatusBadge({ status }: { status: StatusDemanda }) {
  return (
    <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap', STATUS_DEMANDA_STYLE[status])}>
      {STATUS_DEMANDA_LABEL[status]}
    </span>
  )
}

const URGENCIA_STYLE: Record<UrgenciaDemanda, string> = {
  alta:  'text-urgent font-semibold',
  media: 'text-warning font-semibold',
  baixa: 'text-ink-faint',
}
export function UrgenciaBadge({ urgencia }: { urgencia: UrgenciaDemanda }) {
  const labels = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }
  return <span className={cn('text-sm', URGENCIA_STYLE[urgencia])}>{labels[urgencia]}</span>
}

const STATUS_CONTRATO_STYLE: Record<StatusContrato, string> = {
  ativo:        'bg-success-bg text-success',
  inadimplente: 'bg-urgent-bg text-urgent',
  em_renovacao: 'bg-warning-bg text-warning',
  encerrado:    'bg-surface-alt text-ink-faint',
}
const STATUS_CONTRATO_LABEL: Record<StatusContrato, string> = {
  ativo: 'Ativo', inadimplente: 'Inadimplente', em_renovacao: 'Em renovação', encerrado: 'Encerrado'
}
export function StatusContratoBadge({ status }: { status: StatusContrato }) {
  return (
    <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full', STATUS_CONTRATO_STYLE[status])}>
      {STATUS_CONTRATO_LABEL[status]}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('bg-surface border border-line p-5', className)}>{children}</div>
}

// ─── FieldNote ────────────────────────────────────────────
export function FieldNote({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-accent mt-1 leading-relaxed">↳ {children}</p>
}

// ─── ExplainBox ───────────────────────────────────────────
export function ExplainBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#FBF8F5] border border-accent-soft border-l-2 border-l-accent px-4 py-3 mb-5 text-[12.5px] text-ink-soft leading-relaxed">
      {children}
    </div>
  )
}

// ─── SectionTitle ─────────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-3 mt-5 pt-4 border-t border-line first:mt-0 first:pt-0 first:border-t-0">
      {children}
    </h3>
  )
}

// ─── KV (chave/valor) ─────────────────────────────────────
export function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-line last:border-b-0 text-sm gap-3">
      <span className="text-ink-soft shrink-0">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  )
}

// ─── UploadZone ───────────────────────────────────────────
export function UploadZone({ label, onChange }: { label: string; onChange?: (files: FileList) => void }) {
  return (
    <label className="block border border-dashed border-line bg-surface-alt p-5 text-center cursor-pointer hover:border-ink-faint transition-colors">
      <span className="block text-sm font-semibold text-ink-soft mb-1">{label}</span>
      <span className="text-xs text-ink-faint">Arraste ou clique para selecionar — PDF, imagem</span>
      <input type="file" multiple className="hidden" onChange={e => e.target.files && onChange?.(e.target.files)} />
    </label>
  )
}

// ─── DocChip ──────────────────────────────────────────────
export function DocChip({ nome, onClick }: { nome: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 bg-surface-alt border border-line px-2.5 py-1 text-[12px] font-mono hover:border-ink-faint transition-colors"
    >
      📎 {nome}
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────
export function Empty({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 text-ink-faint">
      <p className="text-sm font-semibold text-ink-soft mb-1">{title}</p>
      {description && <p className="text-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return <div className={cn('w-5 h-5 border-2 border-line border-t-accent rounded-full animate-spin', className)} />
}
