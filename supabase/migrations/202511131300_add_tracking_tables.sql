-- Enable UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table storing which blueprints a user is tracking for habits and/or action items
CREATE TABLE IF NOT EXISTS tracked_blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blueprint_id UUID NOT NULL REFERENCES habit_blueprints(id) ON DELETE CASCADE,
  track_habits BOOLEAN NOT NULL DEFAULT false,
  track_actions BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tracked_blueprints_unique_user_blueprint UNIQUE (user_id, blueprint_id)
);

CREATE INDEX IF NOT EXISTS idx_tracked_blueprints_user ON tracked_blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_blueprints_user_habits ON tracked_blueprints(user_id) WHERE track_habits;
CREATE INDEX IF NOT EXISTS idx_tracked_blueprints_user_actions ON tracked_blueprints(user_id) WHERE track_actions;

-- Table storing completion state for tracked blueprint items
CREATE TABLE IF NOT EXISTS blueprint_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blueprint_id UUID NOT NULL REFERENCES habit_blueprints(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('daily_habit', 'sequential_step', 'decision_checklist')),
  item_id TEXT NOT NULL,
  completed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blueprint_completions_unique_per_day UNIQUE (user_id, blueprint_id, section_type, item_id, completed_on)
);

CREATE INDEX IF NOT EXISTS idx_blueprint_completions_user ON blueprint_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_completions_blueprint ON blueprint_completions(blueprint_id);
