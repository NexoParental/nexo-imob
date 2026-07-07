-- Planos e assinaturas Stripe

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'trial' CHECK (plano IN ('trial', 'starter', 'professional', 'enterprise')),
  ADD COLUMN IF NOT EXISTS plano_status TEXT DEFAULT 'active' CHECK (plano_status IN ('active', 'past_due', 'canceled', 'trialing')),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');
