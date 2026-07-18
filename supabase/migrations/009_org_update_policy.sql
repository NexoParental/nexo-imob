-- =====================================================
-- Migration 009: Policy de UPDATE em organizations
-- =====================================================
-- Sem isso, o checkout do Stripe não conseguia salvar
-- stripe_customer_id (update silenciosamente bloqueado
-- pelo RLS), criando um novo customer a cada tentativa.

create policy if not exists "org_update" on organizations
  for update using (id = my_org_id());
