-- =====================================================================
-- Migration 005: Enable Row Level Security (RLS) on all tables
-- SYSTEM_DESIGN.md §9 Security
-- Note: Internal backend callers use getDbClient() (service-role key)
-- which bypasses RLS. Anon/authenticated client access policies are
-- defined in 010_rls_policies.sql.
-- =====================================================================

ALTER TABLE IF EXISTS site_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS circuit_breaker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS generation_queue ENABLE ROW LEVEL SECURITY;
