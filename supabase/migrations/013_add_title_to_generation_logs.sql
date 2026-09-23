-- Add title column to generation_logs for user-facing audit history
ALTER TABLE generation_logs ADD COLUMN IF NOT EXISTS title TEXT;
