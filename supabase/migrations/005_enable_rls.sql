-- =====================================================================
-- Migration 005: Enable Row Level Security (RLS) on all tables
-- SYSTEM_DESIGN.md §9 Security
-- =====================================================================

ALTER TABLE IF EXISTS site_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS circuit_breaker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS generation_queue ENABLE ROW LEVEL SECURITY;
