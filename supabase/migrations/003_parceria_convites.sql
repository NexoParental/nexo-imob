-- =====================================================
-- Migration 003: Convites de parceria + RLS cruzada
-- =====================================================

-- Tabela de convites
create table if not exists convites_parceria (
  id         uuid primary key default gen_random_uuid(),
  token      text unique not null default encode(gen_random_bytes(32), 'hex'),
  de_org_id  uuid not null references organizations(id) on delete cascade,
  para_email text not null,
  aceito     boolean default false,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days'
);

alter table convites_parceria enable row level security;

create policy "convites_select" on convites_parceria for select
  using (de_org_id = my_org_id());
create policy "convites_insert" on convites_parceria for insert
  with check (de_org_id = my_org_id());

-- =====================================================
-- RLS: leitura cruzada imobiliária → jurídico parceiro
-- =====================================================

-- PESSOAS
drop policy if exists "pessoas_all"             on pessoas;
drop policy if exists "pessoas_imob_all"        on pessoas;
drop policy if exists "pessoas_juridico_select" on pessoas;

create policy "pessoas_imob_all" on pessoas for all
  using  (organization_id = my_org_id())
  with check (organization_id = my_org_id());

create policy "pessoas_juridico_select" on pessoas for select
  using (
    exists (
      select 1 from parcerias p
      where p.imobiliaria_id = pessoas.organization_id
        and p.juridico_id    = my_org_id()
        and p.ativo
    )
  );

-- IMÓVEIS
drop policy if exists "imoveis_all"             on imoveis;
drop policy if exists "imoveis_imob_all"        on imoveis;
drop policy if exists "imoveis_juridico_select" on imoveis;

create policy "imoveis_imob_all" on imoveis for all
  using  (organization_id = my_org_id())
  with check (organization_id = my_org_id());

create policy "imoveis_juridico_select" on imoveis for select
  using (
    exists (
      select 1 from parcerias p
      where p.imobiliaria_id = imoveis.organization_id
        and p.juridico_id    = my_org_id()
        and p.ativo
    )
  );

-- CONTRATOS
drop policy if exists "contratos_all"             on contratos;
drop policy if exists "contratos_imob_all"        on contratos;
drop policy if exists "contratos_juridico_select" on contratos;

create policy "contratos_imob_all" on contratos for all
  using  (organization_id = my_org_id())
  with check (organization_id = my_org_id());

create policy "contratos_juridico_select" on contratos for select
  using (
    exists (
      select 1 from parcerias p
      where p.imobiliaria_id = contratos.organization_id
        and p.juridico_id    = my_org_id()
        and p.ativo
    )
  );
