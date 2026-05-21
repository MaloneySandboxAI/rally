-- Guest sessions: track anonymous play state for challenge links
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  temp_user_id TEXT NOT NULL UNIQUE,
  challenge_code TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_temp_user ON public.guest_sessions(temp_user_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_challenge ON public.guest_sessions(challenge_code);

ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create guest sessions" ON public.guest_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read guest sessions" ON public.guest_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can update guest sessions" ON public.guest_sessions FOR UPDATE USING (true);

-- Ensure challenger_id is nullable (may already be, but safe to run)
ALTER TABLE public.challenges ALTER COLUMN challenger_id DROP NOT NULL;

-- Allow public read for guest play (challenge pages are already in PUBLIC_PREFIXES)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'challenges' AND policyname = 'Public can read challenges'
  ) THEN
    CREATE POLICY "Public can read challenges"
      ON public.challenges FOR SELECT USING (true);
  END IF;
END $$;
