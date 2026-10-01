-- Migration 017: Deep Crawler & Brand Intelligence columns for Site Profiles
ALTER TABLE site_profiles
  ADD COLUMN IF NOT EXISTS crawl_status TEXT NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS crawl_progress INT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS crawl_page_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crawl_error TEXT;

CREATE INDEX IF NOT EXISTS idx_site_profiles_crawl_status ON site_profiles (crawl_status);
