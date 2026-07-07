-- =====================================================
-- NEXO IMOB — Migration 001: Schema completo
-- =====================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- =====================================================
-- ORGANIZATIONS
-- =====================================================
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('imobiliaria', 'juridico')),
  created_at timestamptz default now()
);

-- =====================================================
-- PROFILES (extends auth.users)
-- =====================================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('gestor', 'administrativo', 'corretor', 'advogado')),
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Auto-criar profile ao criar usuário
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, organization_id, name, email, role)
  values (
    new.id,
    (new.raw_user_meta_data->>'organization_id')::uuid,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'administrativo')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =====================================================
-- PESSOAS
-- =====================================================
create table pessoas (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  tipo_pessoa text not null check (tipo_pessoa in ('fisica', 'juridica')),
  papel_principal text not null check (papel_principal in ('proprietario', 'inquilino', 'comprador', 'fiador')),
  nome text not null,
  cpf text,
  cnpj text,
  rg text,
  orgao_emissor text,
  estado_civil text,
  profissao text,
  representante_legal text,
  telefone text,
  email text,
  endereco text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- IMÓVEIS
-- =====================================================
create table imoveis (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  logradouro text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  cidade text not null,
  uf char(2) not null,
  cep text,
  tipo text not null check (tipo in ('apartamento', 'casa', 'comercial', 'terreno')),
  matricula text,
  cartorio text,
  inscricao_municipal text,
  proprietario_id uuid references pessoas(id),
  condominio_nome text,
  condominio_contato text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- CONTRATOS
-- =====================================================
create sequence contrato_numero_seq;

create table contratos (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  numero text not null unique,
  tipo text not null check (tipo in ('locacao_residencial', 'locacao_comercial', 'compra_venda', 'administracao')),
  imovel_id uuid not null references imoveis(id),
  proprietario_id uuid not null references pessoas(id),
  inquilino_id uuid not null references pessoas(id),
  tipo_garantia text not null check (tipo_garantia in ('fiador', 'seguro_fianca', 'caucao', 'titulo', 'sem_garantia')),
  fiador_id uuid references pessoas(id),
  garantia_descricao text,
  data_inicio date not null,
  prazo_meses int,
  valor numeric(12,2) not null,
  indice_reajuste text,
  status text not null default 'ativo' check (status in ('ativo', 'inadimplente', 'em_renovacao', 'encerrado')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-gerar número do contrato
create or replace function gerar_numero_contrato()
returns trigger as $$
begin
  if new.numero is null or new.numero = '' then
    new.numero := lpad(nextval('contrato_numero_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger before_insert_contrato
  before insert on contratos
  for each row execute function gerar_numero_contrato();

-- =====================================================
-- DEMANDAS
-- =====================================================
create sequence demanda_numero_seq;

create table demandas (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  protocolo text not null unique,
  contrato_id uuid not null references contratos(id),
  tipo text not null check (tipo in ('cobranca', 'notificacao', 'despejo', 'contratual', 'condominial', 'distrato')),
  urgencia text not null default 'media' check (urgencia in ('alta', 'media', 'baixa')),
  status text not null default 'aberta' check (status in ('aberta', 'em_analise', 'aguardando_doc', 'protocolado', 'em_andamento', 'concluida')),
  aberta_por uuid not null references profiles(id),
  responsavel_juridico uuid references profiles(id),
  prazo date,
  campos_extras jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-gerar protocolo
create or replace function gerar_protocolo_demanda()
returns trigger as $$
begin
  new.protocolo := lpad(nextval('demanda_numero_seq')::text, 4, '0') || '/' || extract(year from now())::text;
  return new;
end;
$$ language plpgsql;

create trigger before_insert_demanda
  before insert on demandas
  for each row execute function gerar_protocolo_demanda();

-- Updated_at automático
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_demandas_updated_at before update on demandas for each row execute function update_updated_at();
create trigger trg_contratos_updated_at before update on contratos for each row execute function update_updated_at();
create trigger trg_imoveis_updated_at before update on imoveis for each row execute function update_updated_at();
create trigger trg_pessoas_updated_at before update on pessoas for each row execute function update_updated_at();

-- =====================================================
-- MENSAGENS (timeline do caso)
-- =====================================================
create table mensagens (
  id uuid primary key default uuid_generate_v4(),
  demanda_id uuid not null references demandas(id) on delete cascade,
  autor_id uuid not null references profiles(id),
  conteudo text not null,
  tipo text not null default 'mensagem' check (tipo in ('mensagem', 'mudanca_status', 'documento')),
  status_anterior text,
  status_novo text,
  created_at timestamptz default now()
);

-- =====================================================
-- DOCUMENTOS
-- =====================================================
create table documentos (
  id uuid primary key default uuid_generate_v4(),
  demanda_id uuid references demandas(id) on delete cascade,
  contrato_id uuid references contratos(id) on delete cascade,
  imovel_id uuid references imoveis(id) on delete cascade,
  pessoa_id uuid references pessoas(id) on delete cascade,
  mensagem_id uuid references mensagens(id) on delete cascade,
  nome text not null,
  storage_path text not null,
  mime_type text,
  tamanho_bytes bigint,
  uploaded_by uuid not null references profiles(id),
  created_at timestamptz default now()
);

-- =====================================================
-- PARCERIAS (imobiliária ↔ escritório)
-- =====================================================
create table parcerias (
  id uuid primary key default uuid_generate_v4(),
  imobiliaria_id uuid not null references organizations(id),
  juridico_id uuid not null references organizations(id),
  ativo boolean default true,
  created_at timestamptz default now(),
  unique(imobiliaria_id, juridico_id)
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table pessoas enable row level security;
alter table imoveis enable row level security;
alter table contratos enable row level security;
alter table demandas enable row level security;
alter table mensagens enable row level security;
alter table documentos enable row level security;
alter table parcerias enable row level security;

-- Helper: organização do usuário atual
create or replace function my_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid()
$$ language sql security definer stable;

-- Helper: tipo da organização do usuário atual
create or replace function my_org_type()
returns text as $$
  select o.type from organizations o
  join profiles p on p.organization_id = o.id
  where p.id = auth.uid()
$$ language sql security definer stable;

-- Helper: papel do usuário atual
create or replace function my_role()
returns text as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

-- Organizations: cada um vê só a sua
create policy "org_select" on organizations for select using (
  id = my_org_id() or
  exists (select 1 from parcerias where (imobiliaria_id = id or juridico_id = id) and (imobiliaria_id = my_org_id() or juridico_id = my_org_id()) and ativo)
);

-- Profiles: vê da própria org
create policy "profiles_select" on profiles for select using (organization_id = my_org_id());
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- Pessoas, Imóveis, Contratos: só a imobiliária dona
create policy "pessoas_all" on pessoas for all using (organization_id = my_org_id());
create policy "imoveis_all" on imoveis for all using (organization_id = my_org_id());
create policy "contratos_all" on contratos for all using (organization_id = my_org_id());

-- Demandas: imobiliária dona + escritório parceiro
create policy "demandas_select" on demandas for select using (
  organization_id = my_org_id() or
  exists (
    select 1 from parcerias p
    join contratos c on c.organization_id = p.imobiliaria_id
    where c.id = demandas.contrato_id
    and p.juridico_id = my_org_id()
    and p.ativo
  )
);
create policy "demandas_insert" on demandas for insert with check (organization_id = my_org_id());
create policy "demandas_update" on demandas for update using (
  organization_id = my_org_id() or
  responsavel_juridico = auth.uid()
);

-- Mensagens: quem pode ver a demanda pode ver as mensagens
create policy "mensagens_select" on mensagens for select using (
  exists (select 1 from demandas d where d.id = demanda_id and (
    d.organization_id = my_org_id() or
    exists (select 1 from parcerias p join contratos c on c.organization_id = p.imobiliaria_id
      where c.id = d.contrato_id and p.juridico_id = my_org_id() and p.ativo)
  ))
);
create policy "mensagens_insert" on mensagens for insert with check (autor_id = auth.uid());

-- Documentos: mesma regra de acesso
create policy "documentos_select" on documentos for select using (
  uploaded_by = auth.uid() or
  (demanda_id is not null and exists (
    select 1 from demandas d where d.id = demanda_id and (
      d.organization_id = my_org_id() or
      exists (select 1 from parcerias p join contratos c on c.organization_id = p.imobiliaria_id
        where c.id = d.contrato_id and p.juridico_id = my_org_id() and p.ativo)
    )
  )) or
  (contrato_id is not null and exists (select 1 from contratos where id = contrato_id and organization_id = my_org_id())) or
  (imovel_id is not null and exists (select 1 from imoveis where id = imovel_id and organization_id = my_org_id()))
);
create policy "documentos_insert" on documentos for insert with check (uploaded_by = auth.uid());

-- Parcerias
create policy "parcerias_select" on parcerias for select using (
  imobiliaria_id = my_org_id() or juridico_id = my_org_id()
);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
insert into storage.buckets (id, name, public) values ('documentos', 'documentos', false);

create policy "documentos_upload" on storage.objects for insert with check (
  bucket_id = 'documentos' and auth.role() = 'authenticated'
);
create policy "documentos_download" on storage.objects for select using (
  bucket_id = 'documentos' and auth.role() = 'authenticated'
);
