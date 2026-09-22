-- Multi-Tenant Site Profiles Table (SYSTEM_DESIGN.md §4, §5)
CREATE TABLE IF NOT EXISTS site_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  api_key_hash TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  brand_knowledge TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'authoritative, actionable, conversion-focused',
  target_audience TEXT NOT NULL DEFAULT 'business decision makers and professionals',
  internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  monthly_quota INT NOT NULL DEFAULT 100,
  used_quota INT NOT NULL DEFAULT 0,
  groq_model TEXT NOT NULL DEFAULT 'openai/gpt-oss-120b',
  gemini_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup on incoming API requests by hashed x-api-key
CREATE INDEX IF NOT EXISTS idx_site_profiles_api_key_hash ON site_profiles (api_key_hash);
CREATE INDEX IF NOT EXISTS idx_site_profiles_active ON site_profiles (is_active);

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_site_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_site_profiles_updated_at ON site_profiles;
CREATE TRIGGER trg_site_profiles_updated_at
BEFORE UPDATE ON site_profiles
FOR EACH ROW
EXECUTE FUNCTION update_site_profiles_updated_at();
