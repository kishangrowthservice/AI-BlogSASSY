-- =====================================================================
-- Migration 006: Production Atomic Concurrency RPCs & Monthly Quota Reset
-- SYSTEM_DESIGN.md (Production Hardening)
-- =====================================================================

-- 1. Atomic Tenant Quota Increment (Eliminates read-modify-write race)
CREATE OR REPLACE FUNCTION increment_tenant_quota(p_site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE site_profiles
  SET used_quota = COALESCE(used_quota, 0) + 1,
      updated_at = now()
  WHERE id = p_site_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atomic Rate Limiter with Upsert (Eliminates burst bypass race)
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

-- 3. Atomic Queue Job Claim (FOR UPDATE SKIP LOCKED — Eliminates double billing/generation)
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

-- 4. Monthly Quota Reset (Run on 1st of each month via pg_cron or cron API route)
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
