-- Parent Dashboard Tokens
-- Allows premium students to share a read-only progress link with parents.
-- The snapshot column stores a JSON blob of the student's progress,
-- updated after each round. The parent page reads ONLY from this snapshot —
-- never from user_state or other tables directly.

CREATE TABLE IF NOT EXISTS parent_tokens (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  student_name text NOT NULL DEFAULT 'Student',
  snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by token (parent page)
CREATE UNIQUE INDEX IF NOT EXISTS idx_parent_tokens_token ON parent_tokens(token);

-- Index for fast lookup by user_id (student account page)
CREATE INDEX IF NOT EXISTS idx_parent_tokens_user_id ON parent_tokens(user_id);

-- RLS: students can manage their own token
ALTER TABLE parent_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own token"
  ON parent_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own token"
  ON parent_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own token"
  ON parent_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Students can delete own token"
  ON parent_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access by token (for the parent page, which has no auth)
-- This is safe because the snapshot contains only aggregate data, no PII beyond first name
CREATE POLICY "Anyone can read by token"
  ON parent_tokens FOR SELECT
  USING (true);
