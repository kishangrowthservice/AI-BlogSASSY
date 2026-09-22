-- =====================================================================
-- Migration 007: 10,000+ Concurrent Users Production Architecture
-- SYSTEM_DESIGN.md (Massive Concurrency & Distributed Hardening)
-- =====================================================================

-- 1. Atomic Circuit Breaker Canary Acquisition (Eliminates Thundering Herd)
-- Exactly ONE concurrent request acquires the right to probe a recovering provider.
-- All other concurrent requests continue diverting to fallback.
CREATE OR REPLACE FUNCTION acquire_circuit_canary(
  p_provider TEXT,
  p_cooloff_seconds INT
)
RETURNS TABLE(should_probe BOOLEAN, current_state TEXT, reason TEXT) AS $$
DECLARE
  v_updated INT;
  v_rec RECORD;
BEGIN
  -- Try to atomically transition OPEN -> HALF-OPEN if cooloff expired
  UPDATE circuit_breaker_state
  SET state = 'half-open',
      updated_at = now()
  WHERE provider = p_provider
    AND state = 'open'
    AND opened_at IS NOT NULL
    AND (now() - opened_at) >= (p_cooloff_seconds || ' seconds')::INTERVAL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- Fetch current state
  SELECT * INTO v_rec FROM circuit_breaker_state WHERE provider = p_provider;

  IF v_updated > 0 THEN
    -- This specific request won the canary race
    RETURN QUERY SELECT true, 'half-open'::TEXT, 'Canary probe assigned to test provider recovery.'::TEXT;
  ELSIF v_rec.state = 'open' THEN
    -- Still in cooloff; continue diverting to fallback
    RETURN QUERY SELECT false, 'open'::TEXT, 'Circuit OPEN. Diverting to fallback.'::TEXT;
  ELSIF v_rec.state = 'half-open' THEN
    -- Another request is already acting as canary probe; divert this one to fallback
    RETURN QUERY SELECT false, 'half-open'::TEXT, 'Canary probe already in flight. Diverting to fallback.'::TEXT;
  ELSE
    -- Circuit is closed / healthy
    RETURN QUERY SELECT false, 'closed'::TEXT, 'Provider healthy.'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Distributed Login Lockout Table (Works across 100+ serverless lambdas)
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_address TEXT PRIMARY KEY,
  failed_attempts INT NOT NULL DEFAULT 1,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- 3. Atomic Login Rate Limiter RPC
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

  -- Check if already locked
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
    -- Success: reset counter
    DELETE FROM admin_login_attempts WHERE ip_address = p_ip;
    RETURN QUERY SELECT false, 0, 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
