/**
 * Rally State Sync Layer
 *
 * Abstracts user state (gems, hearts, stats, streaks) behind a unified API
 * that writes to both localStorage (for instant reads) and Supabase (for
 * persistence across devices and app reinstalls).
 *
 * Currently: localStorage-only (existing behavior).
 * Next step: Enable Supabase sync by uncommenting the server writes.
 *
 * This is critical for iOS App Store — localStorage in a WebView is volatile
 * and won't sync across devices. The migration path:
 *
 * Phase 1 (current): All reads/writes go through this layer → localStorage
 * Phase 2: Add Supabase user_state table, write-through on every mutation
 * Phase 3: On app load, merge server state with local state (server wins on conflicts)
 *
 * Supabase table schema (for Phase 2):
 *
 *   CREATE TABLE user_state (
 *     user_id uuid PRIMARY KEY REFERENCES auth.users(id),
 *     gems integer NOT NULL DEFAULT 300,
 *     hearts integer NOT NULL DEFAULT 5,
 *     hearts_date text,
 *     rounds_today integer NOT NULL DEFAULT 0,
 *     rounds_date text,
 *     streak integer NOT NULL DEFAULT 0,
 *     best_streak integer NOT NULL DEFAULT 0,
 *     last_played text,
 *     streak_freeze boolean NOT NULL DEFAULT false,
 *     stats_deep_dive boolean NOT NULL DEFAULT false,
 *     stats jsonb,
 *     last_login_date text,
 *     updated_at timestamptz DEFAULT now()
 *   );
 *
 *   ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Users can read own state" ON user_state
 *     FOR SELECT USING (auth.uid() = user_id);
 *   CREATE POLICY "Users can update own state" ON user_state
 *     FOR UPDATE USING (auth.uid() = user_id);
 *   CREATE POLICY "Users can insert own state" ON user_state
 *     FOR INSERT WITH CHECK (auth.uid() = user_id);
 */

import { createClient } from "@/lib/supabase/client"

// Keys mirroring the existing localStorage keys
const KEYS = {
  gems: "rally_gems",
  hearts: "rally_hearts",
  heartsDate: "rally_hearts_date",
  roundsToday: "rally_rounds_today",
  roundsDate: "rally_rounds_date",
  streak: "rally_streak",
  lastPlayed: "rally_last_played",
  streakFreeze: "rally_streak_freeze",
  statsDeepDive: "rally_stats_deep_dive",
  stats: "rally_stats",
  lastLogin: "rally_last_login",
  isPro: "rally_is_pro",
  targetScore: "rally_target_score",
  onboardingComplete: "rally_onboarding_complete",
  subtopicLevels: "rally_subtopic_levels",
  diagnostic: "rally_diagnostic",
} as const

/**
 * Get the current user's ID from Supabase auth, or null if not logged in
 */
async function getUserId(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

/**
 * Sync local state TO Supabase
 * Call this after any state mutation to persist server-side
 */
export async function syncToServer(): Promise<void> {
  // DISABLED — server sync is intentionally a no-op (localStorage is the single
  // source of truth) until a real conflict-resolution layer is built in v1.1.
  //
  // Why: the previous upsert wrote `subtopic_levels` and `diagnostic` columns
  // that do NOT exist in the `user_state` table (see migration 006), so every
  // write failed silently — the server row stayed frozen at its DEFAULTS
  // (gems = 300, streak = 0, etc.). syncFromServer() then restored those
  // defaults over good local data on every navigation, resetting the user's
  // gems to 300 (and streak to 0). Simply "fixing the columns" is NOT safe: the
  // first load would read the frozen 300 and wipe every existing user's real
  // gem balance once. So the whole round-trip is disabled here; lib/hearts.ts
  // and lib/gem-context.tsx already persist to localStorage on their own.
  // See "State sync is disabled" in CLAUDE.md.
  return
}

/**
 * Sync FROM Supabase to local state
 * Call this on app load / login to restore server state
 */
export async function syncFromServer(): Promise<boolean> {
  // DISABLED — see syncToServer() above. This used to overwrite local state
  // ("server wins") on every navigation, but the server row is frozen at its
  // defaults (writes always failed), so it was resetting users' gems to 300 and
  // streaks to 0. Returning false leaves local state untouched (initSync treats
  // false as "no server state — local stands as-is").
  // See "State sync is disabled" in CLAUDE.md.
  return false
}

/**
 * Initialize sync on app load
 * Call this from the root layout or auth gate after login
 */
export async function initSync(): Promise<void> {
  const restored = await syncFromServer()
  if (!restored) {
    // First time on this device — no server state yet
    // Local state stands as-is
  }
}

/**
 * Export KEYS for use in migration scripts
 */
export { KEYS as STATE_KEYS }
