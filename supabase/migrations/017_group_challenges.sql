-- 017: Group Challenge Mode
-- Multiplayer challenges: one creator, up to 30 players, shared question pool

CREATE TABLE IF NOT EXISTS group_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  creator_id uuid REFERENCES auth.users(id),
  creator_name text NOT NULL,
  category text NOT NULL,
  question_ids integer[] NOT NULL,
  max_players int DEFAULT 30,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '7 days'
);

CREATE TABLE IF NOT EXISTS group_challenge_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_challenge_id uuid NOT NULL REFERENCES group_challenges(id) ON DELETE CASCADE,
  player_id uuid REFERENCES auth.users(id),
  player_name text NOT NULL,
  score int DEFAULT -1,
  gems_earned int DEFAULT 0,
  correct_count int DEFAULT 0,
  completed_at timestamptz,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_challenge_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_gc_code ON group_challenges(code);
CREATE INDEX IF NOT EXISTS idx_gc_creator ON group_challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_gce_challenge ON group_challenge_entries(group_challenge_id);
CREATE INDEX IF NOT EXISTS idx_gce_player ON group_challenge_entries(player_id);

ALTER TABLE group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_challenge_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can view group challenges (they're shared via link)
CREATE POLICY "Anyone can view group challenges"
  ON group_challenges FOR SELECT USING (true);

-- Authenticated users can create group challenges
CREATE POLICY "Authenticated users can create group challenges"
  ON group_challenges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only creator can update (close) their group challenge
CREATE POLICY "Creator can update own group challenge"
  ON group_challenges FOR UPDATE USING (creator_id = auth.uid());

-- Anyone can view entries (leaderboard is public)
CREATE POLICY "Anyone can view group challenge entries"
  ON group_challenge_entries FOR SELECT USING (true);

-- Anyone can join (insert entry) — guests included via anon key
CREATE POLICY "Anyone can join group challenges"
  ON group_challenge_entries FOR INSERT WITH CHECK (true);

-- Players can update their own entry (submit score)
CREATE POLICY "Players can update own entry"
  ON group_challenge_entries FOR UPDATE
  USING (player_id = auth.uid() OR player_id IS NULL);
