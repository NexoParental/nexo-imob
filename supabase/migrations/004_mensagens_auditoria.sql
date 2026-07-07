-- =====================================================
-- Migration 004: Auditoria de mensagens + perfis entre orgs
-- =====================================================

-- 1. Profiles: parceiros podem ler nomes uns dos outros
--    (sem isso o autor das mensagens aparece como "—")
create policy "profiles_parceiro_select" on profiles for select using (
  exists (
    select 1 from parcerias p
    where (
      (p.imobiliaria_id = profiles.organization_id and p.juridico_id = my_org_id()) or
      (p.juridico_id    = profiles.organization_id and p.imobiliaria_id = my_org_id())
    )
    and p.ativo
  )
);

-- 2. Campos de auditoria nas mensagens
alter table mensagens
  add column if not exists conteudo_original text,
  add column if not exists editado_por       uuid references profiles(id),
  add column if not exists editado_em        timestamptz,
  add column if not exists excluido          boolean default false,
  add column if not exists excluido_por      uuid references profiles(id),
  add column if not exists excluido_em       timestamptz;

-- 3. Permitir que gestor edite/exclua qualquer mensagem;
--    autor pode editar a própria (mas não excluir)
create policy "mensagens_update" on mensagens for update using (
  autor_id = auth.uid() or my_role() = 'gestor'
);
