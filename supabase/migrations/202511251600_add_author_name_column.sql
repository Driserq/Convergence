-- Add optional author_name column to habit_blueprints for storing video authors
ALTER TABLE habit_blueprints
  ADD COLUMN IF NOT EXISTS author_name TEXT;
