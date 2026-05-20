-- ============================================================
-- Migration 022: Critical RLS / RPC Security Fixes
-- ------------------------------------------------------------
-- Addresses critical issues found in the H2H feature review:
--   1. push_subscriptions  — drop the world-readable SELECT policy
--   2. challenges          — lock down the UPDATE policy + completion RPC
--   3. upsert_h2h_record   — add caller authorization
--   4. group_challenge_entries — lock down INSERT / UPDATE policies
--
-- (Issue 5 — push notification authorization — is fixed in the
--  send-push-notification edge function and the service worker,
--  not in the database.)
--
-- This migration is idempotent and safe to re-run.
-- ============================================================


-- ============================================================
-- 1. PUSH_SUBSCRIPTIONS — remove the world-readable policy
-- ============================================================
-- "Service role can read all subscriptions" used USING (true), which
-- applies to the anon and authenticated roles too — so any visitor
-- could read every user's push endpoint and crypto keys and send them
-- arbitrary notifications. The service role bypasses RLS anyway, so the
-- policy was both useless and dangerous. The remaining policy
-- "Users can manage their own subscription" (FOR ALL USING
-- user_id = auth.uid()) already covers all legitimate client access.
DROP POLICY IF EXISTS "Service role can read all subscriptions" ON push_subscriptions;


-- ============================================================
-- 2. CHALLENGES — lock down the UPDATE policy
-- ============================================================
-- The old "Participants can update challenges" policy allowed
-- `challenger_id IS NULL`, letting ANY user (including anonymous) rewrite
-- any pending, unaccepted challenge. It also had no WITH CHECK, so a
-- challenger could overwrite the creator's score and other columns.
--
-- New model:
--   * Direct UPDATE is restricted to actual participants.
--   * A BEFORE UPDATE trigger prevents non-creators from mutating
--     creator-owned columns, and makes the core challenge definition
--     (category / question pool / share code) immutable for everyone.
--   * The challenger-completion step (the pending -> completed
--     transition) legitimately needs to write a row where the caller is
--     not yet a participant — and must work for guests too — so it goes
--     through the SECURITY DEFINER complete_challenge() RPC below.

DROP POLICY IF EXISTS "Participants can update challenges" ON challenges;

CREATE POLICY "Participants can update challenges"
  ON challenges FOR UPDATE
  USING (
    creator_id = auth.uid()
    OR challenger_id = auth.uid()
  )
  WITH CHECK (
    creator_id = auth.uid()
    OR challenger_id = auth.uid()
  );

-- Trigger: protect creator-owned and immutable columns.
-- WITH CHECK alone cannot do this — it validates the final row, not
-- which columns changed — so a participant trigger is required.
CREATE OR REPLACE FUNCTION challenges_protect_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- The core challenge definition is immutable once created.
  IF NEW.share_code   IS DISTINCT FROM OLD.share_code
  OR NEW.category     IS DISTINCT FROM OLD.category
  OR NEW.question_ids IS DISTINCT FROM OLD.question_ids THEN
    RAISE EXCEPTION 'Challenge code, category and question pool are immutable';
  END IF;

  -- Creator-owned columns may only be modified by the creator.
  IF auth.uid() IS DISTINCT FROM OLD.creator_id THEN
    IF NEW.creator_id      IS DISTINCT FROM OLD.creator_id
    OR NEW.creator_name    IS DISTINCT FROM OLD.creator_name
    OR NEW.creator_score   IS DISTINCT FROM OLD.creator_score
    OR NEW.creator_results IS DISTINCT FROM OLD.creator_results THEN
      RAISE EXCEPTION 'Only the challenge creator can modify creator fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS challenges_protect_fields_trigger ON challenges;
CREATE TRIGGER challenges_protect_fields_trigger
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION challenges_protect_fields();

-- RPC: complete a pending challenge as the challenger.
-- SECURITY DEFINER so it can perform the pending -> completed transition
-- for a caller who is not yet a participant (including anonymous
-- guests). It only ever writes challenger-owned columns + status, and
-- derives challenger_id from auth.uid() (never from a parameter), so it
-- cannot be used to forge creator data or impersonate another user.
-- Returns true only if a pending challenge was actually completed.
CREATE OR REPLACE FUNCTION complete_challenge(
  p_share_code         text,
  p_challenger_name    text,
  p_challenger_score   int,
  p_challenger_results jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated int;
BEGIN
  UPDATE challenges
  SET challenger_id      = auth.uid(),
      challenger_name    = p_challenger_name,
      challenger_score   = p_challenger_score,
      challenger_results = p_challenger_results,
      status             = 'completed',
      completed_at       = now()
  WHERE share_code = p_share_code
    AND status = 'pending';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION complete_challenge(text, text, int, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION complete_challenge(text, text, int, jsonb) TO anon, authenticated;


-- ============================================================
-- 3. UPSERT_H2H_RECORD — add caller authorization
-- ============================================================
-- The old RPC let any caller forge head-to-head records for any pair of
-- users. It now verifies:
--   (a) the caller (auth.uid()) is one of the two players, and
--   (b) a completed challenge in this category actually backs the
--       win/loss being recorded.
CREATE OR REPLACE FUNCTION upsert_h2h_record(
  p_winner_id uuid,
  p_loser_id  uuid,
  p_category  text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_p1 uuid;
  v_p2 uuid;
  v_winner_is_p1 boolean;
BEGIN
  -- A player cannot have a head-to-head record against themselves.
  IF p_winner_id = p_loser_id THEN
    RAISE EXCEPTION 'Winner and loser must be different players';
  END IF;

  -- (a) The caller must be one of the two players.
  IF auth.uid() IS NULL
     OR (auth.uid() <> p_winner_id AND auth.uid() <> p_loser_id) THEN
    RAISE EXCEPTION 'Not authorized to record this head-to-head result';
  END IF;

  -- (b) A completed challenge between these two players in this category
  --     must actually support the recorded win/loss.
  IF NOT EXISTS (
    SELECT 1 FROM challenges c
    WHERE c.status = 'completed'
      AND c.category = p_category
      AND (
        (c.creator_id = p_winner_id AND c.challenger_id = p_loser_id
           AND c.creator_score > c.challenger_score)
        OR
        (c.creator_id = p_loser_id AND c.challenger_id = p_winner_id
           AND c.challenger_score > c.creator_score)
      )
  ) THEN
    RAISE EXCEPTION 'No completed challenge supports this head-to-head result';
  END IF;

  -- Store the smaller UUID as player1 (matches the h2h_ordered CHECK).
  IF p_winner_id < p_loser_id THEN
    v_p1 := p_winner_id;
    v_p2 := p_loser_id;
    v_winner_is_p1 := true;
  ELSE
    v_p1 := p_loser_id;
    v_p2 := p_winner_id;
    v_winner_is_p1 := false;
  END IF;

  INSERT INTO head_to_head (player1_id, player2_id, category, player1_wins, player2_wins, last_played)
  VALUES (
    v_p1, v_p2, p_category,
    CASE WHEN v_winner_is_p1 THEN 1 ELSE 0 END,
    CASE WHEN v_winner_is_p1 THEN 0 ELSE 1 END,
    now()
  )
  ON CONFLICT (player1_id, player2_id, category) DO UPDATE SET
    player1_wins = head_to_head.player1_wins + CASE WHEN v_winner_is_p1 THEN 1 ELSE 0 END,
    player2_wins = head_to_head.player2_wins + CASE WHEN v_winner_is_p1 THEN 0 ELSE 1 END,
    last_played = now();
END;
$$;

-- Head-to-head records only matter for authenticated users.
REVOKE EXECUTE ON FUNCTION upsert_h2h_record(uuid, uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION upsert_h2h_record(uuid, uuid, text) TO authenticated;


-- ============================================================
-- 4. GROUP_CHALLENGE_ENTRIES — lock down INSERT / UPDATE
-- ============================================================
-- Old policies: INSERT WITH CHECK (true) let anyone insert an entry for
-- any user with any score; UPDATE allowed any caller to overwrite any
-- guest (player_id IS NULL) entry. Both made the leaderboard forgeable.

DROP POLICY IF EXISTS "Anyone can join group challenges" ON group_challenge_entries;
DROP POLICY IF EXISTS "Players can update own entry" ON group_challenge_entries;

-- INSERT: a player may only create an entry for themselves (or an
-- anonymous guest entry), and every new entry must start unplayed so a
-- pre-scored entry cannot be injected straight onto the leaderboard.
CREATE POLICY "Players can insert own entry"
  ON group_challenge_entries FOR INSERT
  WITH CHECK (
    (player_id = auth.uid() OR player_id IS NULL)
    AND score = -1
    AND gems_earned = 0
    AND correct_count = 0
    AND completed_at IS NULL
  );

-- UPDATE: authenticated players may update their own entry. Guest
-- entries (player_id IS NULL) can only be updated while still unplayed
-- (score < 0) — a guest can submit a score once, but no one can
-- overwrite a score that has already been submitted.
CREATE POLICY "Players can update own entry"
  ON group_challenge_entries FOR UPDATE
  USING (
    player_id = auth.uid()
    OR (player_id IS NULL AND score < 0)
  )
  WITH CHECK (
    player_id = auth.uid()
    OR player_id IS NULL
  );
