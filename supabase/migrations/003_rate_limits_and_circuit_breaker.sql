-- Rate Limits & Circuit Breaker Schema (SYSTEM_DESIGN.md §5, §7)
-- Enforces per-tenant noisy-neighbor protection before calling providers,
-- and circuit breaker state shared across serverless function instances.

-- 1. Short-window rate limit buckets per tenant (noisy-neighbor protection)
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  site_id UUID NOT NULL REFERENCES site_profiles(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (site_id, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_window ON rate_limit_buckets(window_start);

-- 2. Circuit breaker state per provider
CREATE TABLE IF NOT EXISTS circuit_breaker_state (
  provider TEXT PRIMARY KEY,
  consecutive_failures INT NOT NULL DEFAULT 0,
  failure_threshold INT NOT NULL DEFAULT 3,
  cooloff_seconds INT NOT NULL DEFAULT 30,
  last_failure_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  state TEXT NOT NULL DEFAULT 'closed', -- 'closed' | 'open' | 'half-open'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial circuit breaker row for Groq primary provider
INSERT INTO circuit_breaker_state (provider, consecutive_failures, failure_threshold, cooloff_seconds, state)
VALUES ('groq', 0, 3, 30, 'closed')
ON CONFLICT (provider) DO NOTHING;
