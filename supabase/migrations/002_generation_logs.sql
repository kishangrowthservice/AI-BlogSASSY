-- Generation Logs Schema (SYSTEM_DESIGN.md §5, §10, §11)
-- One row per request: site_id, provider used, latency, token usage, success/failure, finish_reason
-- Feeds observability, tenant analytics, and per-tenant billing.

CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES site_profiles(id) ON DELETE CASCADE,
  provider_used TEXT NOT NULL,          -- 'groq' | 'gemini' | 'none'
  model TEXT NOT NULL,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  latency_ms INT NOT NULL,
  finish_reason TEXT,                  -- 'stop' | 'length' | etc.
  status TEXT NOT NULL,                -- 'success' | 'failed'
  error_message TEXT,
  fallback_triggered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for observability dashboards and tenant aggregations
CREATE INDEX IF NOT EXISTS idx_generation_logs_site_id ON generation_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_provider ON generation_logs(provider_used);
