-- Add creator_id and challenger_id to challenges table (links to auth.users)
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id);
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS challenger_id uuid REFERENCES auth.users(id);

-- Index for fast lookup of a user's challenges
CREATE INDEX IF NOT EXISTS idx_challenges_creator_id ON challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenger_id ON challenges(challenger_id);

-- Add username column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;

-- RLS policy: allow users to read challenges they're part of
CREATE POLICY "Users can read own challenges" ON challenges
  FOR SELECT USING (
    creator_id = auth.uid() OR challenger_id = auth.uid()
  );

-- Allow anon to insert challenges (for challenge creation)
CREATE POLICY "Anon can insert challenges" ON challenges
  FOR INSERT WITH CHECK (true);

-- Allow anon to update challenges (for submitting results)
CREATE POLICY "Anon can update challenges" ON challenges
  FOR UPDATE USING (true);

-- Allow users to update their own username
CREATE POLICY "Users can update own username" ON users
  FOR UPDATE USING (id = auth.uid());
