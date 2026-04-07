-- Referral system: each user gets a unique referral code.
-- When a referred user signs up and completes their first round, both get 500 gems.

-- Add referral columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES users(id);

-- Create index for fast referral code lookups
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES users(id),
  referred_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  gems_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(referred_id)  -- each user can only be referred once
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can see their own referrals (as referrer)
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Only server/service role inserts referrals (via API), but allow authenticated insert for now
CREATE POLICY "Authenticated users can insert referrals" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- Allow update for completing referrals
CREATE POLICY "System can update referrals" ON referrals
  FOR UPDATE USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Function to generate a unique referral code for users who don't have one
-- Uses first 8 chars of a random UUID
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate referral code on user insert
CREATE OR REPLACE TRIGGER set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Backfill existing users with referral codes
UPDATE users
SET referral_code = substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)
WHERE referral_code IS NULL;

-- Allow users to read their own referral_code
-- (Existing RLS on users table should already allow this, but ensure select works)
