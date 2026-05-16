-- 018: Split gems_awarded into two columns for referrer vs referred tracking
-- The old single boolean couldn't distinguish who got their bonus

ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referred_gems_awarded boolean NOT NULL DEFAULT false;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referrer_gems_awarded boolean NOT NULL DEFAULT false;

-- Migrate existing data: if gems_awarded was true, both parties got theirs
UPDATE referrals SET referred_gems_awarded = gems_awarded, referrer_gems_awarded = gems_awarded;

-- Drop the old column
ALTER TABLE referrals DROP COLUMN IF EXISTS gems_awarded;

-- Tighten RLS: referred user can only complete their referral, referrer can only claim their bonus
DROP POLICY IF EXISTS "System can update referrals" ON referrals;

CREATE POLICY "Referred user can complete referral" ON referrals
  FOR UPDATE USING (auth.uid() = referred_id)
  WITH CHECK (
    status = 'completed' AND referred_gems_awarded = true
  );

CREATE POLICY "Referrer can claim bonus" ON referrals
  FOR UPDATE USING (auth.uid() = referrer_id)
  WITH CHECK (referrer_gems_awarded = true);

-- RPC for atomic referrer claim (prevents race conditions across tabs)
CREATE OR REPLACE FUNCTION claim_referral_bonuses(p_referrer_id uuid)
RETURNS int AS $$
DECLARE
  claimed_count int;
BEGIN
  UPDATE referrals
  SET referrer_gems_awarded = true
  WHERE referrer_id = p_referrer_id
    AND status = 'completed'
    AND referred_gems_awarded = true
    AND referrer_gems_awarded = false;

  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
