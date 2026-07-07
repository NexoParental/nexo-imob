-- =====================================================
-- Migration 006: Dashboard, Notificações, Calendário
-- =====================================================

-- Tabela de notificações enviadas (auditoria)
create table if not exists notificacoes_enviadas (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references profiles(id) on delete cascade,
  tipo       text not null check (tipo in ('demanda_respondida', 'prazo_vencendo', 'novo_usuario', 'mensagem_lida')),
  demanda_id uuid references demandas(id) on delete cascade,
  titulo     text not null,
  descricao  text,
  lido       boolean default false,
  enviado_em timestamptz default now(),
  lido_em    timestamptz
);

alter table notificacoes_enviadas enable row level security;

create policy "notif_select" on notificacoes_enviadas for select using (usuario_id = auth.uid());
create policy "notif_update" on notificacoes_enviadas for update using (usuario_id = auth.uid());

-- Tabela de configurações de notificações (por usuário)
create table if not exists notificacoes_config (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid unique not null references profiles(id) on delete cascade,
  email      boolean default true,
  sms        boolean default false,
  push       boolean default true,
  prazo_dias_antes int default 3,
  criado_em  timestamptz default now()
);

alter table notificacoes_config enable row level security;

create policy "config_select" on notificacoes_config for select using (usuario_id = auth.uid());
create policy "config_update" on notificacoes_config for update using (usuario_id = auth.uid());

-- Tabela de processos judiciais (para integração CNJ)
create table if not exists processos_cnj (
  id              uuid primary key default gen_random_uuid(),
  demanda_id      uuid not null unique references demandas(id) on delete cascade,
  numero_processo text unique,
  status          text,
  data_andamento  timestamptz,
  proximos_prazos text[],
  sincronizado_em timestamptz,
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

alter table processos_cnj enable row level security;

create policy "cnj_select" on processos_cnj for select using (
  exists (select 1 from demandas d where d.id = demanda_id and (
    d.organization_id = my_org_id() or
    exists (select 1 from parcerias p where
      (p.imobiliaria_id = d.organization_id and p.juridico_id = my_org_id()) or
      (p.juridico_id = d.organization_id and p.imobiliaria_id = my_org_id())
    )
  ))
);

-- Tabela de consultas de matrícula (eRPJ)
create table if not exists matriculas_consultadas (
  id              uuid primary key default gen_random_uuid(),
  imovel_id       uuid not null references imoveis(id) on delete cascade,
  numero_matricula text,
  cartorio        text,
  proprietario    text,
  area_m2         numeric,
  onus_hipotecas  jsonb,
  sincronizado_em timestamptz,
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

alter table matriculas_consultadas enable row level security;

create policy "mat_select" on matriculas_consultadas for select using (
  exists (select 1 from imoveis i where i.id = imovel_id and i.organization_id = my_org_id())
);

-- Tabela de documentos gerados (notificação, carta, aviso)
create table if not exists documentos_gerados (
  id          uuid primary key default gen_random_uuid(),
  demanda_id  uuid not null references demandas(id) on delete cascade,
  tipo        text not null check (tipo in ('notificacao_extrajudicial', 'carta_cobranca', 'aviso_despejo', 'distrato')),
  titulo      text not null,
  conteudo    text,
  gerado_por  uuid not null references profiles(id),
  arquivo_url text,
  gerado_em   timestamptz default now()
);

alter table documentos_gerados enable row level security;

create policy "docs_gen_select" on documentos_gerados for select using (
  exists (select 1 from demandas d where d.id = demanda_id and (
    d.organization_id = my_org_id() or
    exists (select 1 from parcerias p where
      (p.imobiliaria_id = d.organization_id and p.juridico_id = my_org_id()) or
      (p.juridico_id = d.organization_id and p.imobiliaria_id = my_org_id())
    )
  ))
);

create policy "docs_gen_insert" on documentos_gerados for insert with check (gerado_por = auth.uid());
