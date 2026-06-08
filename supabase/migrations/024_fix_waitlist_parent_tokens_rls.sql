-- ============================================================
-- Migration 024: Fix waitlist + parent_tokens RLS holes
-- ------------------------------------------------------------
-- Two critical world-readable SELECT policies:
--   1. waitlist       — scripts/004 regressed the SELECT policy to
--                       USING (true), letting anyone read every signup
--                       email. Restore USING (false) (the original from
--                       scripts/001). The /api/health count query still
--                       works: USING (false) returns count 0, no error.
--   2. parent_tokens  — 008 shipped an "Anyone can read by token"
--                       USING (true) policy, letting anyone enumerate
--                       every parent token and the child progress
--                       snapshot attached to it. Replace direct table
--                       access with a SECURITY DEFINER RPC that only
--                       returns the snapshot for an exact token, and
--                       drop the public SELECT policy.
--
-- This migration is idempotent and safe to re-run.
-- ============================================================


-- ============================================================
-- 1. WAITLIST — lock the SELECT policy back down
-- ============================================================
DROP POLICY IF EXISTS "Service role can read" ON public.waitlist;

CREATE POLICY "Service role can read" ON public.waitlist
  FOR SELECT
  USING (false);


-- ============================================================
-- 2. PARENT_TOKENS — token lookup via SECURITY DEFINER RPC
-- ============================================================
-- The public parent page (/parent/[token]) has no auth, so it can't be
-- covered by an owner RLS policy. Instead of a world-readable SELECT
-- policy, it now goes through this function, which returns only the
-- three columns the page renders and only for an exact token match.
-- SECURITY DEFINER lets it read past RLS; SET search_path pins schema
-- resolution so the definer's privileges can't be hijacked.
CREATE OR REPLACE FUNCTION public.get_parent_snapshot(p_token text)
RETURNS TABLE (
  snapshot jsonb,
  student_name text,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT pt.snapshot, pt.student_name, pt.updated_at
  FROM public.parent_tokens pt
  WHERE pt.token = p_token;
$$;

REVOKE EXECUTE ON FUNCTION public.get_parent_snapshot(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_parent_snapshot(text) TO anon, authenticated;

-- Drop the world-readable SELECT policy. The owner policies
-- ("Students can read/insert/update/delete own token", all keyed on
-- auth.uid() = user_id) stay intact, so students still manage their own
-- token from their account page.
DROP POLICY IF EXISTS "Anyone can read by token" ON public.parent_tokens;
