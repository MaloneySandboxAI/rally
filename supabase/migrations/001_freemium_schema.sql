-- Rally Freemium Schema Changes
-- Run this in the Supabase SQL editor

-- Add subscription columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text unique;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status text default 'free';
-- values: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled'
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_period text;
-- values: null | 'monthly' | 'annual'
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_ends_at timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_gems_earned integer default 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_gems_reset_at date default current_date;

-- Helper view for clean access checks
CREATE OR REPLACE VIEW user_access AS
SELECT
  id,
  subscription_status,
  CASE
    WHEN subscription_status IN ('active', 'trialing') THEN true
    ELSE false
  END as is_premium,
  daily_gems_earned,
  daily_gems_reset_at,
  CASE
    WHEN subscription_status IN ('active', 'trialing') THEN null
    WHEN daily_gems_reset_at < current_date THEN 0
    ELSE daily_gems_earned
  END as gems_today,
  current_period_ends_at
FROM users;
