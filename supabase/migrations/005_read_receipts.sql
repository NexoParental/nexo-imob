-- =====================================================
-- Migration 005: Confirmação de leitura (read receipts)
-- =====================================================

-- Tabela de leitura
create table if not exists mensagem_leituras (
  id         uuid primary key default gen_random_uuid(),
  mensagem_id uuid not null references mensagens(id) on delete cascade,
  leitor_id  uuid not null references profiles(id) on delete cascade,
  lido_em    timestamptz default now(),
  unique(mensagem_id, leitor_id)
);

alter table mensagem_leituras enable row level security;

create policy "leituras_select" on mensagem_leituras for select using (
  exists (
    select 1 from mensagens m
    join demandas d on d.id = m.demanda_id
    where m.id = mensagem_id and (
      d.organization_id = my_org_id() or
      exists (select 1 from parcerias p
        where (p.imobiliaria_id = d.organization_id and p.juridico_id = my_org_id()) or
              (p.juridico_id = d.organization_id and p.imobiliaria_id = my_org_id()))
    )
  )
);

create policy "leituras_insert" on mensagem_leituras for insert
  with check (leitor_id = auth.uid());
