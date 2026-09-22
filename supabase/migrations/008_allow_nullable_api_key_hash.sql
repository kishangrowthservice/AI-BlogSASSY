-- Migration 008: Allow nullable api_key_hash for self-serve onboarding before on-demand key generation
-- Also add key_prefix to safely display masked key (e.g. gs_live_••••3f21) in dashboard without secret exposure.

ALTER TABLE site_profiles 
  ALTER COLUMN api_key_hash DROP NOT NULL;

ALTER TABLE site_profiles 
  ADD COLUMN IF NOT EXISTS key_prefix TEXT;

-- Index key_prefix for fast dashboard lookups if needed
CREATE INDEX IF NOT EXISTS idx_site_profiles_key_prefix ON site_profiles (key_prefix);
