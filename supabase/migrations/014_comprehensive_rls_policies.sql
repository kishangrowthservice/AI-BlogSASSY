-- Migration 014: Comprehensive Row Level Security (RLS) Policies
-- Closes RLS gap at the database layer (SAAS_READINESS_AUDIT.md)

-- 1. site_profiles: UPDATE policy (users can only update their own profile)
DROP POLICY IF EXISTS "Users can update their own site profile" ON site_profiles;
CREATE POLICY "Users can update their own site profile"
  ON site_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. site_profiles: INSERT policy (users can only insert profile bound to their own auth.uid)
DROP POLICY IF EXISTS "Users can insert their own site profile" ON site_profiles;
CREATE POLICY "Users can insert their own site profile"
  ON site_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. generation_logs: SELECT policy (users can only view logs belonging to their sites)
DROP POLICY IF EXISTS "Users can view their own generation logs" ON generation_logs;
CREATE POLICY "Users can view their own generation logs"
  ON generation_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM site_profiles
      WHERE site_profiles.id = generation_logs.site_id
      AND site_profiles.user_id = auth.uid()
    )
  );
