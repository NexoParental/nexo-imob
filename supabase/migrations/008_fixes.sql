-- =====================================================
-- Migration 008: Correções de schema + Storage bucket
-- =====================================================

-- 1. Adicionar colunas faltantes em notificacoes_enviadas
--    (o route alertas-prazo usa organization_id, destinatarios, referencia_id, referencia_tipo)
alter table notificacoes_enviadas
  add column if not exists organization_id uuid references organizations(id) on delete cascade,
  add column if not exists destinatarios   text[],
  add column if not exists referencia_id   uuid,
  add column if not exists referencia_tipo text;

-- Tornar usuario_id opcional (alertas de prazo não têm usuário específico)
alter table notificacoes_enviadas
  alter column usuario_id drop not null;

-- 2. Ampliar o check de tipo para incluir alertas de prazo
alter table notificacoes_enviadas
  drop constraint if exists notificacoes_enviadas_tipo_check;

alter table notificacoes_enviadas
  add constraint notificacoes_enviadas_tipo_check
  check (tipo in (
    'demanda_respondida', 'prazo_vencendo', 'novo_usuario', 'mensagem_lida',
    'alerta_prazo_d1', 'alerta_prazo_d3', 'alerta_prazo_d7'
  ));

-- 3. Política RLS para org ver suas próprias notificações enviadas
drop policy if exists "notif_org_select" on notificacoes_enviadas;
create policy "notif_org_select" on notificacoes_enviadas
  for select using (organization_id = my_org_id());

-- 4. Criar bucket de storage para documentos (se não existir)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos',
  'documentos',
  false,
  52428800, -- 50 MB por arquivo
  array['application/pdf','image/jpeg','image/png','image/webp','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

-- Política: usuário autenticado pode fazer upload/download de docs da sua org
drop policy if exists "docs_insert" on storage.objects;
create policy "docs_insert" on storage.objects
  for insert with check (
    bucket_id = 'documentos' and auth.role() = 'authenticated'
  );

drop policy if exists "docs_select" on storage.objects;
create policy "docs_select" on storage.objects
  for select using (
    bucket_id = 'documentos' and auth.role() = 'authenticated'
  );

-- 5. Colunas Stripe na organizations (idempotente — caso migration 007 não tenha rodado)
alter table organizations
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plano                  text default 'trial',
  add column if not exists plano_status           text default 'active',
  add column if not exists trial_ends_at          timestamptz default (now() + interval '14 days');

-- 6. Índice para buscas frequentes por prazo no calendário
create index if not exists idx_demandas_prazo
  on demandas (prazo)
  where prazo is not null and status != 'concluida';
