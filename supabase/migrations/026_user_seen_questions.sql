-- Track which questions each player has seen, so challenge pools
-- never repeat across plays (until the bank is exhausted).
-- player_id is either the Supabase auth UUID or the guest UUID.
CREATE TABLE IF NOT EXISTS user_seen_questions (
  player_id text NOT NULL,
  question_id int NOT NULL,
  seen_at timestamptz DEFAULT now(),
  PRIMARY KEY (player_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_user_seen_questions_player
  ON user_seen_questions (player_id);

-- Service-role client handles all writes, so RLS is permissive for reads
-- and restricted for writes.
ALTER TABLE user_seen_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON user_seen_questions;
CREATE POLICY "Service role full access"
  ON user_seen_questions FOR ALL
  USING (true)
  WITH CHECK (true);
