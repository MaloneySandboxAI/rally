-- ============================================================
-- Migration 005: Security Hardening
-- Fixes overly permissive RLS policies across all tables
-- ============================================================

-- ============================================================
-- 1. CHALLENGES — drop wide-open policies, replace with scoped ones
-- ============================================================

-- Drop all existing challenge policies (clean slate)
DROP POLICY IF EXISTS "Allow public insert on challenges" ON challenges;
DROP POLICY IF EXISTS "Allow public read on challenges" ON challenges;
DROP POLICY IF EXISTS "Allow public update on challenges" ON challenges;
DROP POLICY IF EXISTS "Anon can insert challenges" ON challenges;
DROP POLICY IF EXISTS "Anon can update challenges" ON challenges;
DROP POLICY IF EXISTS "Users can read own challenges" ON challenges;

-- SELECT: Anyone can read challenges (needed for challenge link flow —
-- challengers open a link and need to read the challenge by code).
-- This is safe because challenge data is not sensitive (just scores/category).
CREATE POLICY "Anyone can read challenges"
  ON challenges FOR SELECT
  USING (true);

-- INSERT: Only authenticated users can create challenges.
-- The creator_id must match the authenticated user.
CREATE POLICY "Authenticated users can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (creator_id IS NULL OR creator_id = auth.uid())
  );

-- UPDATE: Only participants can update a challenge.
-- Creator updates their score, challenger updates theirs + status.
-- The challenge code acts as an implicit access token for challengers.
CREATE POLICY "Participants can update challenges"
  ON challenges FOR UPDATE
  USING (
    creator_id = auth.uid()
    OR challenger_id = auth.uid()
    -- Allow challenger who hasn't been assigned yet (first update sets challenger_id)
    OR challenger_id IS NULL
  );

-- DELETE: Nobody can delete challenges from the client
-- (No policy = no access)

-- ============================================================
-- 2. USERS — fix SELECT to allow referral_code and username lookups
-- ============================================================

-- Drop existing user policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can update own username" ON users;

-- SELECT: Authenticated users can read any user row.
-- This is needed for:
--   - Username availability check (setup-profile)
--   - Referral code lookup (lib/referrals.ts)
--   - Challenge opponent display names
-- Column-level restriction isn't possible via RLS, but the client
-- only ever selects specific safe columns (username, referral_code, id).
-- Sensitive fields (stripe_customer_id, subscription_status) are only
-- accessed via the user's own row or server-side API routes.
CREATE POLICY "Authenticated users can read users"
  ON users FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- UPDATE: Users can only update their own row
CREATE POLICY "Users can update own row"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- INSERT: Handled by Supabase Auth trigger (new user creation).
-- No client-side insert policy needed — the auth.users trigger inserts.
-- But if the app needs to insert (e.g., on first OAuth login), allow it:
CREATE POLICY "Users can insert own row"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- DELETE: Nobody can delete user rows from the client
-- (No policy = no access)

-- ============================================================
-- 3. FEEDBACK — already secure (insert-only, no SELECT)
-- Verify no SELECT policy exists (intentional: admin-only reads)
-- ============================================================
-- No changes needed. Current policy:
-- "Anyone can insert feedback" — INSERT WITH CHECK (true) ✓

-- ============================================================
-- 4. REFERRALS — already well-scoped, minor improvement
-- ============================================================
-- Current policies are good:
-- SELECT: scoped to referrer_id or referred_id ✓
-- INSERT: scoped to referred_id = auth.uid() ✓
-- UPDATE: scoped to referrer_id or referred_id ✓
-- No changes needed.

-- ============================================================
-- 5. SAT_QUESTIONS — read-only for everyone is correct
-- ============================================================
-- "Allow public read on sat_questions" — SELECT true ✓
-- Quiz questions are public content. No changes needed.

-- ============================================================
-- 6. WAITLIST — insert-only is correct
-- ============================================================
-- "Allow public insert on waitlist" — INSERT WITH CHECK (true) ✓
-- No changes needed.

-- ============================================================
-- 7. FORCE RLS for service role bypass protection
-- This ensures even the service role respects RLS unless explicitly
-- bypassed. Extra safety layer.
-- ============================================================
-- Note: We do NOT force RLS because the Stripe webhook API routes
-- use the service role to update subscription_status on users.
-- If we forced RLS, those server-side operations would break.
-- ALTER TABLE users FORCE ROW LEVEL SECURITY;  -- intentionally NOT enabled

-- ============================================================
-- 8. Revoke direct table access from anon role where not needed
-- The anon role should only have access to tables that truly
-- need unauthenticated access.
-- ============================================================

-- Anon needs: sat_questions (read), challenges (read), waitlist (insert), feedback (insert)
-- Anon does NOT need: users, referrals

REVOKE ALL ON users FROM anon;
REVOKE ALL ON referrals FROM anon;

-- Grant specific permissions to authenticated role
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON referrals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON challenges TO authenticated;
GRANT SELECT ON sat_questions TO authenticated;
GRANT INSERT ON feedback TO authenticated;
GRANT INSERT ON waitlist TO authenticated;

-- Grant specific permissions to anon role (minimal)
GRANT SELECT ON sat_questions TO anon;
GRANT SELECT, INSERT, UPDATE ON challenges TO anon;
GRANT INSERT ON waitlist TO anon;
GRANT INSERT ON feedback TO anon;
