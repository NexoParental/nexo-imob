-- =====================================================
-- Migration 003: Leitura cruzada imobiliária ↔ jurídico
--
-- Abre SELECT para o escritório parceiro nas tabelas
-- pessoas, imoveis e contratos. Escrita continua
-- exclusiva da imobiliária dona dos dados.
-- =====================================================

-- PESSOAS
drop policy if exists "pessoas_all" on pessoas;

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
drop policy if exists "imoveis_all" on imoveis;

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
drop policy if exists "contratos_all" on contratos;

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
