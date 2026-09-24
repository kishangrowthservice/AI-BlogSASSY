-- =====================================================================
-- Migration 016: Article Content & Metadata Persistence
-- Stores the generated HTML content, meta description, and tags in
-- generation_logs so tenants can inspect and copy past articles.
-- =====================================================================

ALTER TABLE generation_logs
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS suggested_tags TEXT[];
