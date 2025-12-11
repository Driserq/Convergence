-- Add Stripe customer and subscription IDs to user_subscriptions table
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
