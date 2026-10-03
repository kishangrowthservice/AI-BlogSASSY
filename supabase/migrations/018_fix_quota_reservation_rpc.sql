-- =====================================================================
-- Migration 018: Fix Ambiguous Column Reference in reserve_tenant_quota
-- =====================================================================

CREATE OR REPLACE FUNCTION reserve_tenant_quota(p_site_id UUID)
RETURNS TABLE(reserved BOOLEAN, used_quota INT, monthly_quota INT) AS $$
DECLARE
  v_used INT;
  v_limit INT;
BEGIN
  UPDATE site_profiles
  SET used_quota = site_profiles.used_quota + 1
  WHERE site_profiles.id = p_site_id AND site_profiles.used_quota < site_profiles.monthly_quota
  RETURNING site_profiles.used_quota, site_profiles.monthly_quota INTO v_used, v_limit;

  IF FOUND THEN
    RETURN QUERY SELECT true, v_used, v_limit;
  ELSE
    SELECT s.used_quota, s.monthly_quota INTO v_used, v_limit FROM site_profiles s WHERE s.id = p_site_id;
    RETURN QUERY SELECT false, v_used, v_limit;
  END IF;
END;
$$ LANGUAGE plpgsql;
