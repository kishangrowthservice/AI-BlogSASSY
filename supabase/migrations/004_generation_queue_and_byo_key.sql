-- Generation Queue & Tenant BYO-Key Schema (SYSTEM_DESIGN.md §8 Scaling Strategy)

-- 1. Add BYO-Key support per site profile
ALTER TABLE site_profiles ADD COLUMN IF NOT EXISTS byo_groq_api_key TEXT;
ALTER TABLE site_profiles ADD COLUMN IF NOT EXISTS byo_gemini_api_key TEXT;

-- 2. Async queue for burst smoothing
CREATE TABLE IF NOT EXISTS generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES site_profiles(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  result JSONB,
  error_message TEXT,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient cron polling and tenant lookup
CREATE INDEX IF NOT EXISTS idx_generation_queue_poll ON generation_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_generation_queue_site_id ON generation_queue(site_id);
