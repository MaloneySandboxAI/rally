-- Feedback table to store user feedback from the in-app feedback button
CREATE TABLE IF NOT EXISTS feedback (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  reaction text NOT NULL CHECK (reaction IN ('loving', 'ok', 'broken', 'other')),
  message text,
  page text,
  created_at timestamptz DEFAULT now()
);

-- Index for quick lookups by user
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (including guests with null user_id)
CREATE POLICY "Anyone can insert feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Only allow reading feedback via service role (admin/dashboard), not client
-- No SELECT policy = no client reads
