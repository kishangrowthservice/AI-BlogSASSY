-- =====================================================================
-- MULTI-TENANT AI BLOG GENERATION PLATFORM — COMPLETE SUPABASE SCHEMA
-- SYSTEM_DESIGN.md (Phases 1 - 6)
-- Run this in your Supabase SQL Web Editor (https://supabase.com/dashboard)
-- =====================================================================

-- 1. Site Profiles Table (Tenants)
CREATE TABLE IF NOT EXISTS site_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  api_key_hash TEXT UNIQUE,
  key_prefix TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  brand_knowledge TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'authoritative, actionable, conversion-focused',
  target_audience TEXT NOT NULL DEFAULT 'business decision makers and professionals',
  internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  monthly_quota INT NOT NULL DEFAULT 100,
  used_quota INT NOT NULL DEFAULT 0,
  groq_model TEXT NOT NULL DEFAULT 'openai/gpt-oss-120b',
  gemini_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  byo_groq_api_key TEXT,
  byo_gemini_api_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for site_profiles
CREATE INDEX IF NOT EXISTS idx_site_profiles_api_key_hash ON site_profiles (api_key_hash);
CREATE INDEX IF NOT EXISTS idx_site_profiles_key_prefix ON site_profiles (key_prefix);
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

-- 2. Generation Logs Table (Observability & Billing)
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

-- Indexes for generation_logs
CREATE INDEX IF NOT EXISTS idx_generation_logs_site_id ON generation_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_provider ON generation_logs(provider_used);

-- 3. Rate Limit Buckets (Noisy-Neighbor Protection)
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  site_id UUID NOT NULL REFERENCES site_profiles(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (site_id, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_window ON rate_limit_buckets(window_start);

-- 4. Circuit Breaker State (Provider Health)
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

-- Seed Groq provider row
INSERT INTO circuit_breaker_state (provider, consecutive_failures, failure_threshold, cooloff_seconds, state)
VALUES ('groq', 0, 3, 30, 'closed')
ON CONFLICT (provider) DO NOTHING;

-- 5. Generation Queue (Async Burst Smoothing)
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

-- Indexes for generation_queue
CREATE INDEX IF NOT EXISTS idx_generation_queue_poll ON generation_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_generation_queue_site_id ON generation_queue(site_id);

-- 6. Row Level Security (RLS) Policies (§9 Security)
-- Service role key bypasses RLS; anon key blocked from unauthorized access
ALTER TABLE site_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_breaker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;

-- 7. Production Atomic Concurrency RPCs (§7, §8, §9)
CREATE OR REPLACE FUNCTION increment_tenant_quota(p_site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE site_profiles
  SET used_quota = COALESCE(used_quota, 0) + 1,
      updated_at = now()
  WHERE id = p_site_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_site_id UUID,
  p_window_start TIMESTAMPTZ,
  p_limit INT
)
RETURNS TABLE(allowed BOOLEAN, current_count INT) AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO rate_limit_buckets (site_id, window_start, request_count)
  VALUES (p_site_id, p_window_start, 1)
  ON CONFLICT (site_id, window_start)
  DO UPDATE SET request_count = rate_limit_buckets.request_count + 1
  RETURNING request_count INTO v_count;

  RETURN QUERY SELECT (v_count <= p_limit), v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION claim_next_queue_jobs(p_batch_size INT)
RETURNS SETOF generation_queue AS $$
BEGIN
  RETURN QUERY
  UPDATE generation_queue
  SET status = 'processing',
      updated_at = now()
  WHERE id IN (
    SELECT id FROM generation_queue
    WHERE status = 'pending' AND scheduled_for <= now()
    ORDER BY scheduled_for ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS INT AS $$
DECLARE
  affected_count INT;
BEGIN
  UPDATE site_profiles
  SET used_quota = 0,
      updated_at = now()
  WHERE used_quota > 0;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. High Concurrency Canary Acquisition (10,000+ Users Thundering Herd Protection)
CREATE OR REPLACE FUNCTION acquire_circuit_canary(
  p_provider TEXT,
  p_cooloff_seconds INT
)
RETURNS TABLE(should_probe BOOLEAN, current_state TEXT, reason TEXT) AS $$
DECLARE
  v_updated INT;
  v_rec RECORD;
BEGIN
  UPDATE circuit_breaker_state
  SET state = 'half-open',
      updated_at = now()
  WHERE provider = p_provider
    AND state = 'open'
    AND opened_at IS NOT NULL
    AND (now() - opened_at) >= (p_cooloff_seconds || ' seconds')::INTERVAL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  SELECT * INTO v_rec FROM circuit_breaker_state WHERE provider = p_provider;

  IF v_updated > 0 THEN
    RETURN QUERY SELECT true, 'half-open'::TEXT, 'Canary probe assigned to test provider recovery.'::TEXT;
  ELSIF v_rec.state = 'open' THEN
    RETURN QUERY SELECT false, 'open'::TEXT, 'Circuit OPEN. Diverting to fallback.'::TEXT;
  ELSIF v_rec.state = 'half-open' THEN
    RETURN QUERY SELECT false, 'half-open'::TEXT, 'Canary probe already in flight. Diverting to fallback.'::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'closed'::TEXT, 'Provider healthy.'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Distributed Login Lockout Table (Zero In-Memory State across Lambdas)
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_address TEXT PRIMARY KEY,
  failed_attempts INT NOT NULL DEFAULT 1,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS admin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION check_and_record_login_attempt(
  p_ip TEXT,
  p_is_failure BOOLEAN,
  p_max_attempts INT DEFAULT 5,
  p_lockout_seconds INT DEFAULT 900
)
RETURNS TABLE(is_locked BOOLEAN, remaining_lock_seconds INT, failed_count INT) AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := now();
  v_locked_until TIMESTAMPTZ;
  v_new_failures INT;
BEGIN
  SELECT * INTO v_rec FROM admin_login_attempts WHERE ip_address = p_ip;

  IF v_rec.locked_until IS NOT NULL AND v_rec.locked_until > v_now THEN
    RETURN QUERY SELECT true, EXTRACT(EPOCH FROM (v_rec.locked_until - v_now))::INT, v_rec.failed_attempts;
    RETURN;
  END IF;

  IF p_is_failure THEN
    v_new_failures := COALESCE(v_rec.failed_attempts, 0) + 1;
    IF v_new_failures >= p_max_attempts THEN
      v_locked_until := v_now + (p_lockout_seconds || ' seconds')::INTERVAL;
    ELSE
      v_locked_until := NULL;
    END IF;

    INSERT INTO admin_login_attempts (ip_address, failed_attempts, locked_until, updated_at)
    VALUES (p_ip, v_new_failures, v_locked_until, v_now)
    ON CONFLICT (ip_address)
    DO UPDATE SET failed_attempts = v_new_failures,
                  locked_until = v_locked_until,
                  updated_at = v_now;

    RETURN QUERY SELECT (v_locked_until IS NOT NULL), 
                        COALESCE(EXTRACT(EPOCH FROM (v_locked_until - v_now))::INT, 0),
                        v_new_failures;
  ELSE
    DELETE FROM admin_login_attempts WHERE ip_address = p_ip;
    RETURN QUERY SELECT false, 0, 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
