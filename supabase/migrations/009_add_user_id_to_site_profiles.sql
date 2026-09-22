-- Migration 009: Add user_id column to site_profiles to link tenant site with Supabase Auth user.

ALTER TABLE site_profiles 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_site_profiles_user_id ON site_profiles (user_id);
