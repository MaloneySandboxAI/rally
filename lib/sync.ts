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
  if (typeof window === "undefined") return
  const userId = await getUserId()
  if (!userId) return // guest or not logged in

  try {
    const supabase = createClient()
    const state = {
      user_id: userId,
      gems: parseInt(localStorage.getItem(KEYS.gems) || "300", 10),
      hearts: parseInt(localStorage.getItem(KEYS.hearts) || "5", 10),
      hearts_date: localStorage.getItem(KEYS.heartsDate),
      rounds_today: parseInt(localStorage.getItem(KEYS.roundsToday) || "0", 10),
      rounds_date: localStorage.getItem(KEYS.roundsDate),
      streak: parseInt(localStorage.getItem(KEYS.streak) || "0", 10),
      last_played: localStorage.getItem(KEYS.lastPlayed),
      streak_freeze: localStorage.getItem(KEYS.streakFreeze) === "true",
      stats_deep_dive: localStorage.getItem(KEYS.statsDeepDive) === "true",
      stats: JSON.parse(localStorage.getItem(KEYS.stats) || "null"),
      last_login_date: localStorage.getItem(KEYS.lastLogin),
      updated_at: new Date().toISOString(),
    }

    await supabase.from("user_state").upsert(state, { onConflict: "user_id" })
  } catch {
    // Silently fail — local state is the source of truth until sync succeeds
  }
}

/**
 * Sync FROM Supabase to local state
 * Call this on app load / login to restore server state
 */
export async function syncFromServer(): Promise<boolean> {
  if (typeof window === "undefined") return false
  const userId = await getUserId()
  if (!userId) return false

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("user_state")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error || !data) return false

    // Server wins on conflicts — overwrite local state
    localStorage.setItem(KEYS.gems, String(data.gems))
    localStorage.setItem(KEYS.hearts, String(data.hearts))
    if (data.hearts_date) localStorage.setItem(KEYS.heartsDate, data.hearts_date)
    localStorage.setItem(KEYS.roundsToday, String(data.rounds_today))
    if (data.rounds_date) localStorage.setItem(KEYS.roundsDate, data.rounds_date)
    localStorage.setItem(KEYS.streak, String(data.streak))
    if (data.last_played) localStorage.setItem(KEYS.lastPlayed, data.last_played)
    localStorage.setItem(KEYS.streakFreeze, String(data.streak_freeze))
    localStorage.setItem(KEYS.statsDeepDive, String(data.stats_deep_dive))
    if (data.stats) localStorage.setItem(KEYS.stats, JSON.stringify(data.stats))
    if (data.last_login_date) localStorage.setItem(KEYS.lastLogin, data.last_login_date)

    return true
  } catch {
    return false
  }
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
