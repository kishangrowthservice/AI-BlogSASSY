-- =====================================================================
-- Migration 010: Row Level Security Policies
-- SYSTEM_DESIGN.md §9 Security & PHASE1.md Task 2 (Case 2a)
--
-- Audit findings:
-- - site_profiles: Queried by anon-key client in src/app/onboard/page.tsx
--   via supabase.from("site_profiles").select("id").eq("user_id", user.id)
--   Granted: SELECT for authenticated users matching auth.uid() = user_id.
-- - generation_logs, rate_limit_buckets, circuit_breaker_state, generation_queue:
--   Queried exclusively through service-role client (getDbClient()), which
--   bypasses RLS. No anon client call sites exist; no over-granting.
-- =====================================================================

DROP POLICY IF EXISTS "Users can view their own site profile" ON site_profiles;

CREATE POLICY "Users can view their own site profile"
  ON site_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
