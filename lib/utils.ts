import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TipoDemanda, StatusDemanda, UrgenciaDemanda, StatusContrato, TipoGarantia, UserRole } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

export function isPrazoProximo(prazo?: string): boolean {
  if (!prazo) return false
  const diff = new Date(prazo).getTime() - Date.now()
  return diff > 0 && diff < 5 * 24 * 60 * 60 * 1000
}

export function gerarProtocolo(): string {
  const ano = new Date().getFullYear()
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${num.toString().padStart(4, '0')}/${ano}`
}

export const LABELS_TIPO_DEMANDA: Record<TipoDemanda, string> = {
  cobranca: 'Cobrança',
  notificacao: 'Notificação extrajudicial',
  despejo: 'Ação de despejo',
  contratual: 'Contratual',
  condominial: 'Condominial',
  distrato: 'Distrato / rescisão',
}

export const LABELS_STATUS_DEMANDA: Record<StatusDemanda, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  aguardando_doc: 'Aguardando doc.',
  protocolado: 'Protocolado',
  em_andamento: 'Em andamento',
  concluida: 'Concluído',
}

export const LABELS_URGENCIA: Record<UrgenciaDemanda, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

export const LABELS_STATUS_CONTRATO: Record<StatusContrato, string> = {
  ativo: 'Ativo',
  inadimplente: 'Inadimplente',
  em_renovacao: 'Em renovação',
  encerrado: 'Encerrado',
}

export const LABELS_GARANTIA: Record<TipoGarantia, string> = {
  fiador: 'Fiador',
  seguro_fianca: 'Seguro-fiança',
  caucao: 'Caução em depósito',
  titulo: 'Título de capitalização',
  sem_garantia: 'Sem garantia',
}

export const LABELS_ROLE: Record<UserRole, string> = {
  gestor: 'Gestor',
  administrativo: 'Administrativo',
  corretor: 'Corretor',
  advogado: 'Advogado',
}

export function garantiaLabel(tipo: TipoGarantia, descricao?: string, nome?: string): string {
  if (tipo === 'fiador' && nome) return `Fiador: ${nome}`
  if (tipo === 'seguro_fianca' && descricao) return `Seguro-fiança: ${descricao}`
  if (tipo === 'caucao' && descricao) return `Caução: ${descricao}`
  if (tipo === 'titulo' && descricao) return `Título: ${descricao}`
  return LABELS_GARANTIA[tipo]
}
