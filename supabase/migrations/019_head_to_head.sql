-- 019: Head-to-head record tracker
-- Tracks win/loss records between pairs of players per category

CREATE TABLE IF NOT EXISTS head_to_head (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id uuid NOT NULL REFERENCES auth.users(id),
  player2_id uuid NOT NULL REFERENCES auth.users(id),
  category text NOT NULL,
  player1_wins int NOT NULL DEFAULT 0,
  player2_wins int NOT NULL DEFAULT 0,
  last_played timestamptz DEFAULT now(),
  CONSTRAINT h2h_ordered CHECK (player1_id < player2_id),
  UNIQUE(player1_id, player2_id, category)
);

CREATE INDEX IF NOT EXISTS idx_h2h_player1 ON head_to_head(player1_id);
CREATE INDEX IF NOT EXISTS idx_h2h_player2 ON head_to_head(player2_id);

ALTER TABLE head_to_head ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own h2h records" ON head_to_head
  FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- RPC: upsert h2h record, always storing smaller UUID as player1
CREATE OR REPLACE FUNCTION upsert_h2h_record(
  p_winner_id uuid,
  p_loser_id uuid,
  p_category text
) RETURNS void AS $$
DECLARE
  v_p1 uuid;
  v_p2 uuid;
  v_winner_is_p1 boolean;
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
