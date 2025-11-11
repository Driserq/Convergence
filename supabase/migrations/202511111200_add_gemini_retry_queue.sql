-- Ensure UUID generation extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add status tracking to habit_blueprints
ALTER TABLE habit_blueprints
  ADD COLUMN status VARCHAR(20) DEFAULT 'pending'
  CHECK (status IN ('pending', 'completed', 'failed'));

-- Backfill existing records based on AI output presence
UPDATE habit_blueprints
SET status = CASE
  WHEN ai_output IS NOT NULL THEN 'completed'
  ELSE 'pending'
END;

-- Retry queue for Gemini requests
CREATE TABLE gemini_retries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blueprint_id UUID REFERENCES habit_blueprints(id) ON DELETE CASCADE,
  request_data JSONB NOT NULL,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ NOT NULL,
  error_type TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_retries_next_retry ON gemini_retries(next_retry_at);
CREATE INDEX idx_retries_blueprint ON gemini_retries(blueprint_id);
