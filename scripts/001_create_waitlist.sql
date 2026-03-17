-- Create waitlist table for challenge feature signups
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_email TEXT NOT NULL,
  friend_email TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow anonymous inserts (public waitlist)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into the waitlist (public signup)
CREATE POLICY "Allow anonymous inserts" ON public.waitlist
  FOR INSERT
  WITH CHECK (true);

-- Only allow service role to read/update/delete
CREATE POLICY "Service role can read" ON public.waitlist
  FOR SELECT
  USING (false);
