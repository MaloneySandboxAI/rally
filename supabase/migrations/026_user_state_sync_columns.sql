-- Adds the columns the state-sync layer (lib/sync.ts) needs but that the
-- original user_state table (migration 006) never had: subtopic_levels and
-- diagnostic. Their absence was the root cause of the "every sync write fails
-- silently" bug — which froze the server row at its defaults and let
-- syncFromServer clobber local gems back to 300 on every navigation.
--
-- Idempotent: safe to re-run. Apply by pasting into the Supabase SQL editor.

-- Ensure the columns the sync layer writes all exist.
ALTER TABLE user_state ADD COLUMN IF NOT EXISTS subtopic_levels jsonb;
ALTER TABLE user_state ADD COLUMN IF NOT EXISTS diagnostic jsonb;

-- These already exist from migration 006, but ADD ... IF NOT EXISTS makes this
-- migration self-sufficient even if prod drifted from the file history.
ALTER TABLE user_state ADD COLUMN IF NOT EXISTS target_score integer DEFAULT 1200;
ALTER TABLE user_state ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
