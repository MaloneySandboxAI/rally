-- 021: Add source tracking to referrals for challenge-based referrals
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'direct';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS challenge_id bigint;
