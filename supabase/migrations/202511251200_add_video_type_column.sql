-- Add video_type column to store legacy "type" values separately from title
ALTER TABLE habit_blueprints
  ADD COLUMN IF NOT EXISTS video_type TEXT;

-- Backfill the new column with any existing title values if video_type is empty
UPDATE habit_blueprints
SET video_type = title
WHERE video_type IS NULL
  AND title IS NOT NULL
  AND title <> '';
