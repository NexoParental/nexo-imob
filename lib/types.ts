export type OrgType = 'imobiliaria' | 'juridico'
export type UserRole = 'gestor' | 'administrativo' | 'corretor' | 'advogado'
export type TipoImovel = 'apartamento' | 'casa' | 'comercial' | 'terreno'
export type TipoPessoa = 'fisica' | 'juridica'
export type PapelPessoa = 'proprietario' | 'inquilino' | 'comprador' | 'fiador'
export type TipoGarantia = 'fiador' | 'seguro_fianca' | 'caucao' | 'titulo' | 'sem_garantia'
export type TipoContrato = 'locacao_residencial' | 'locacao_comercial' | 'compra_venda' | 'administracao'
export type StatusContrato = 'ativo' | 'inadimplente' | 'em_renovacao' | 'encerrado'
export type TipoDemanda = 'cobranca' | 'notificacao' | 'despejo' | 'contratual' | 'condominial' | 'distrato'
export type UrgenciaDemanda = 'alta' | 'media' | 'baixa'
export type StatusDemanda = 'aberta' | 'em_analise' | 'aguardando_doc' | 'protocolado' | 'em_andamento' | 'concluida'
export type TipoMensagem = 'mensagem' | 'mudanca_status' | 'documento'

export interface Organization {
  id: string
  name: string
  type: OrgType
  created_at: string
}

export interface Profile {
  id: string
  organization_id: string
  name: string
  email: string
  role: UserRole
  created_at: string
  organization?: Organization
}

export interface Imovel {
  id: string
  organization_id: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  tipo: TipoImovel
  matricula?: string
  cartorio?: string
  inscricao_municipal?: string
  proprietario_id?: string
  condominio_nome?: string
  condominio_contato?: string
  created_at: string
  updated_at: string
  proprietario?: Pessoa
}

export interface Pessoa {
  id: string
  organization_id: string
  tipo_pessoa: TipoPessoa
  papel_principal: PapelPessoa
  nome: string
  cpf?: string
  cnpj?: string
  rg?: string
  orgao_emissor?: string
  estado_civil?: string
  profissao?: string
  representante_legal?: string
  telefone?: string
  email?: string
  endereco?: string
  created_at: string
  updated_at: string
}

export interface Contrato {
  id: string
  organization_id: string
  numero: string
  tipo: TipoContrato
  imovel_id: string
  proprietario_id: string
  inquilino_id: string
  tipo_garantia: TipoGarantia
  fiador_id?: string
  garantia_descricao?: string
  data_inicio: string
  prazo_meses?: number
  valor: number
  indice_reajuste?: string
  status: StatusContrato
  created_at: string
  updated_at: string
  imovel?: Imovel
  proprietario?: Pessoa
  inquilino?: Pessoa
  fiador?: Pessoa
}

export interface Demanda {
  id: string
  organization_id: string
  protocolo: string
  contrato_id: string
  tipo: TipoDemanda
  urgencia: UrgenciaDemanda
  status: StatusDemanda
  aberta_por: string
  responsavel_juridico?: string
  prazo?: string
  campos_extras?: Record<string, unknown>
  created_at: string
  updated_at: string
  contrato?: Contrato
  aberta_por_profile?: Profile
  responsavel_profile?: Profile
}

export interface Mensagem {
  id: string
  demanda_id: string
  autor_id: string
  conteudo: string
  tipo: TipoMensagem
  status_anterior?: StatusDemanda
  status_novo?: StatusDemanda
  created_at: string
  autor?: Profile
}

export interface Documento {
  id: string
  demanda_id?: string
  contrato_id?: string
  imovel_id?: string
  pessoa_id?: string
  mensagem_id?: string
  nome: string
  storage_path: string
  mime_type: string
  tamanho_bytes: number
  uploaded_by: string
  created_at: string
  url?: string
}
