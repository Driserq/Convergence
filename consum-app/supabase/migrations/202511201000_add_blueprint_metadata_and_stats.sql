-- Add title and duration columns to habit_blueprints
ALTER TABLE habit_blueprints ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE habit_blueprints ADD COLUMN IF NOT EXISTS duration INTEGER; -- Duration in seconds

-- Create a function to calculate dashboard statistics efficiently on the server side
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  total_blueprints INTEGER;
  total_duration INTEGER;
  youtube_count INTEGER;
  text_count INTEGER;
  youtube_ratio NUMERIC;
  text_ratio NUMERIC;
  start_date TIMESTAMPTZ;
BEGIN
  -- Set the time range to the last 30 days
  start_date := NOW() - INTERVAL '30 days';

  -- Calculate stats for blueprints created in the last 30 days
  SELECT 
    COUNT(*),
    COALESCE(SUM(duration), 0),
    COUNT(*) FILTER (WHERE content_type = 'youtube'),
    COUNT(*) FILTER (WHERE content_type = 'text')
  INTO 
    total_blueprints,
    total_duration,
    youtube_count,
    text_count
  FROM habit_blueprints
  WHERE user_id = target_user_id
  AND created_at >= start_date;

  -- Calculate ratios (prevent division by zero)
  IF total_blueprints > 0 THEN
    youtube_ratio := ROUND((youtube_count::NUMERIC / total_blueprints::NUMERIC) * 100, 1);
    text_ratio := ROUND((text_count::NUMERIC / total_blueprints::NUMERIC) * 100, 1);
  ELSE
    youtube_ratio := 0;
    text_ratio := 0;
  END IF;

  -- Return the result as a JSON object
  RETURN json_build_object(
    'blueprints_count', total_blueprints,
    'time_saved_seconds', total_duration,
    'youtube_ratio', youtube_ratio,
    'text_ratio', text_ratio
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_dashboard_stats(UUID) TO authenticated;
