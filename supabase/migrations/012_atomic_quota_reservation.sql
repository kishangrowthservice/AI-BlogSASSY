-- =====================================================================
-- Migration 012: Atomic Quota Reservation & Release RPCs
-- SYSTEM_DESIGN.md §8 & PHASE4.md Task 1
--
-- Closes quota race condition under concurrent bursts via atomic
-- reserve-then-release functions.
-- =====================================================================

CREATE OR REPLACE FUNCTION reserve_tenant_quota(p_site_id UUID)
RETURNS TABLE(reserved BOOLEAN, used_quota INT, monthly_quota INT) AS $$
DECLARE
  v_used INT;
  v_limit INT;
BEGIN
  UPDATE site_profiles
  SET used_quota = used_quota + 1
  WHERE id = p_site_id AND used_quota < monthly_quota
  RETURNING site_profiles.used_quota, site_profiles.monthly_quota INTO v_used, v_limit;

  IF FOUND THEN
    RETURN QUERY SELECT true, v_used, v_limit;
  ELSE
    SELECT s.used_quota, s.monthly_quota INTO v_used, v_limit FROM site_profiles s WHERE s.id = p_site_id;
    RETURN QUERY SELECT false, v_used, v_limit;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION release_tenant_quota(p_site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE site_profiles SET used_quota = GREATEST(used_quota - 1, 0) WHERE id = p_site_id;
END;
$$ LANGUAGE plpgsql;
