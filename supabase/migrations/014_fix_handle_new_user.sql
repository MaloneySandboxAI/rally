-- ============================================================
-- Migration 014: Fix "Database error saving new user"
--
-- The error occurs because the trigger that creates a row in
-- public.users when a new auth.users row is created is either
-- missing or broken. This migration:
--   1. Creates a robust handle_new_user function
--   2. Drops any existing broken triggers
--   3. Creates a new reliable trigger
-- ============================================================

-- Create or replace the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, subscription_status, daily_gems_earned, daily_gems_reset_at)
  VALUES (
    NEW.id,
    NULL,           -- username set later in setup-profile
    'free',
    0,
    current_date
  )
  ON CONFLICT (id) DO NOTHING;  -- safe if row already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop any existing trigger (clean slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also make the user_state trigger more resilient
CREATE OR REPLACE FUNCTION public.create_user_state()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_state (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't block user creation if user_state insert fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: ensure all existing auth users have a public.users row
INSERT INTO public.users (id, subscription_status, daily_gems_earned, daily_gems_reset_at)
SELECT id, 'free', 0, current_date
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
