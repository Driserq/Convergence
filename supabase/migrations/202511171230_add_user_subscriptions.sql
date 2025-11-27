-- Enable UUID generation for consistency
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core subscription table storing each user's current plan window
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL CHECK (plan_code IN ('free', 'weekly', 'monthly')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_active ON user_subscriptions(plan_code, is_active);

-- Maintain updated_at column automatically
CREATE OR REPLACE FUNCTION set_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_subscriptions_set_updated_at ON user_subscriptions;
CREATE TRIGGER user_subscriptions_set_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW EXECUTE FUNCTION set_user_subscriptions_updated_at();

-- Provision a free subscription for any user missing one
INSERT INTO user_subscriptions (user_id, plan_code, period_start, period_end)
SELECT u.id, 'free', NOW(), NOW() + INTERVAL '1 month'
FROM auth.users u
LEFT JOIN user_subscriptions s ON s.user_id = u.id
WHERE s.user_id IS NULL;
