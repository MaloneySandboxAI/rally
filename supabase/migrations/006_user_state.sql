-- User State table for server-side persistence
-- Mirrors localStorage keys so gems, hearts, stats, and streaks
-- survive app reinstalls and sync across devices (critical for iOS)
--
-- Run this in Supabase SQL Editor when ready to enable server sync.
-- Then uncomment the sync functions in lib/sync.ts.

CREATE TABLE IF NOT EXISTS user_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gems integer NOT NULL DEFAULT 300,
  hearts integer NOT NULL DEFAULT 5,
  hearts_date text,
  rounds_today integer NOT NULL DEFAULT 0,
  rounds_date text,
  streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_played text,
  streak_freeze boolean NOT NULL DEFAULT false,
  stats_deep_dive boolean NOT NULL DEFAULT false,
  stats jsonb,
  last_login_date text,
  target_score integer DEFAULT 1200,
  is_premium boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- RLS: users can only access their own state
ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own state"
  ON user_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own state"
  ON user_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own state"
  ON user_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-create user_state row when a user signs up
CREATE OR REPLACE FUNCTION create_user_state()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_state (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_state'
  ) THEN
    CREATE TRIGGER on_auth_user_created_state
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION create_user_state();
  END IF;
END;
$$;

-- Backfill existing users
INSERT INTO user_state (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Grant access
GRANT SELECT, INSERT, UPDATE ON user_state TO authenticated;
