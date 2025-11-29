-- Add source_payload JSONB column for storing original content payloads
ALTER TABLE habit_blueprints
  ADD COLUMN IF NOT EXISTS source_payload JSONB;

-- Backfill YouTube records with their source URL for future retries
UPDATE habit_blueprints
SET source_payload = jsonb_build_object(
  'contentType', content_type,
  'youtubeUrl', content_source
)
WHERE source_payload IS NULL
  AND content_type = 'youtube';
