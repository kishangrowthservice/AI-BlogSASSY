-- =====================================================================
-- Migration 015: Billing, Subscriptions, and Multi-Site Portfolio
-- Adds Stripe billing customer/subscription tracking, plan tiers,
-- and outbound CMS webhook URLs to site_profiles.
-- =====================================================================

ALTER TABLE site_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Indexes for lightning-fast webhook lookups and billing synchronization
CREATE INDEX IF NOT EXISTS idx_site_profiles_stripe_customer
  ON site_profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_site_profiles_stripe_subscription
  ON site_profiles(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_site_profiles_plan_tier
  ON site_profiles(plan_tier);
