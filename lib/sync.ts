/**
 * Rally State Sync Layer
 *
 * Abstracts user state (gems, hearts, stats, streaks) behind a unified API
 * that writes to both localStorage (for instant reads) and Supabase (for
 * persistence across devices and app reinstalls).
 *
 * ACTIVE: durable progress (gems, streak, stats, subtopic levels, diagnostic,
 * target score) is written through to the `user_state` table and restored on
 * load using LAST-WRITE-WINS, keyed on an `updated_at` timestamp mirrored into
 * localStorage (`rally_state_updated_at`).
 *
 * Conflict resolution:
 *   - Both sides timestamped  → newer wins.
 *   - This device never synced → "richer side wins" (see serverIsRicher): only
 *     adopt the server when it clearly has more progress, so a default/empty
 *     server row can NEVER wipe an existing user's real local data. This guard
 *     is why we can't just "fix the columns" and blindly server-win on load.
 *
 * Requires migration 026 (adds subtopic_levels + diagnostic columns). Until it
 * is applied the upsert fails silently and local simply keeps winning — no data
 * loss, just no server persistence. hearts/rounds are intentionally NOT synced.
 *
 * NOTE: writes go to localStorage IMMEDIATELY by their owning modules
 * (lib/gem-context.tsx, lib/hearts.ts, etc.); this layer only adds the server
 * round-trip on top.
 *
 * Supabase table schema — see migrations 006 (base table) + 026 (adds the
 * subtopic_levels/diagnostic columns this layer writes). Abridged:
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

// localStorage timestamp of the last state mutation this device pushed (or
// adopted from the server). Drives last-write-wins on load. Absent => this
// device has never synced (fresh reinstall OR an existing user upgrading to the
// sync-enabled build) — handled by the "richer side wins" first-contact rule.
const STATE_UPDATED_AT = "rally_state_updated_at"

// hearts/rounds are deliberately NOT synced — they reset daily and round-
// tripping them caused the original "hearts never decrement" bug. Hearts live
// only in localStorage via lib/hearts.ts. Everything below is durable progress.
function buildState(userId: string, updatedAt: string) {
  return {
    user_id: userId,
    gems: parseInt(localStorage.getItem(KEYS.gems) || "300", 10),
    streak: parseInt(localStorage.getItem(KEYS.streak) || "0", 10),
    last_played: localStorage.getItem(KEYS.lastPlayed),
    streak_freeze: localStorage.getItem(KEYS.streakFreeze) === "true",
    stats_deep_dive: localStorage.getItem(KEYS.statsDeepDive) === "true",
    stats: JSON.parse(localStorage.getItem(KEYS.stats) || "null"),
    subtopic_levels: JSON.parse(localStorage.getItem(KEYS.subtopicLevels) || "null"),
    diagnostic: JSON.parse(localStorage.getItem(KEYS.diagnostic) || "null"),
    last_login_date: localStorage.getItem(KEYS.lastLogin),
    target_score: parseInt(localStorage.getItem(KEYS.targetScore) || "1200", 10),
    updated_at: updatedAt,
  }
}

// Write a server row's fields into localStorage (used when the server wins).
function adoptServer(data: Record<string, unknown>): void {
  localStorage.setItem(KEYS.gems, String(data.gems ?? 300))
  localStorage.setItem(KEYS.streak, String(data.streak ?? 0))
  if (data.last_played) localStorage.setItem(KEYS.lastPlayed, String(data.last_played))
  localStorage.setItem(KEYS.streakFreeze, String(!!data.streak_freeze))
  localStorage.setItem(KEYS.statsDeepDive, String(!!data.stats_deep_dive))
  if (data.stats) localStorage.setItem(KEYS.stats, JSON.stringify(data.stats))
  if (data.subtopic_levels) localStorage.setItem(KEYS.subtopicLevels, JSON.stringify(data.subtopic_levels))
  if (data.diagnostic) localStorage.setItem(KEYS.diagnostic, JSON.stringify(data.diagnostic))
  if (data.last_login_date) localStorage.setItem(KEYS.lastLogin, String(data.last_login_date))
  if (typeof data.target_score === "number") localStorage.setItem(KEYS.targetScore, String(data.target_score))
}

// First-contact tie-breaker: is the server row meaningfully more advanced than
// local? Errs toward keeping local — only adopts the server when it clearly has
// more progress (the fresh-reinstall case), so a default/empty server row can
// never wipe an existing user's real local data.
function serverIsRicher(data: Record<string, unknown>): boolean {
  const localGems = parseInt(localStorage.getItem(KEYS.gems) || "300", 10)
  const serverGems = typeof data.gems === "number" ? data.gems : 0
  if (serverGems > localGems) return true
  // Server has play history this device entirely lacks (= fresh reinstall).
  if (data.last_played && !localStorage.getItem(KEYS.lastPlayed)) return true
  if (data.stats && !localStorage.getItem(KEYS.stats)) return true
  return false
}

// --- Write-through (debounced) -------------------------------------------------
// A round-end fires several mutations (gems, streak, stats, subtopic levels), so
// debounce coalesces them into one upsert carrying the final snapshot + a single
// fresh timestamp. The timer lives at module scope, so it still flushes after a
// navigation (syncToServer is fire-and-forget — callers don't await it).
const SYNC_DEBOUNCE_MS = 800
let flushTimer: ReturnType<typeof setTimeout> | null = null

async function flushToServer(): Promise<void> {
  if (typeof window === "undefined") return
  const userId = await getUserId()
  if (!userId) return // guest or not logged in
  try {
    const supabase = createClient()
    const now = new Date().toISOString()
    const state = buildState(userId, now)
    const { error } = await supabase.from("user_state").upsert(state, { onConflict: "user_id" })
    // Only claim this device is "in sync as of now" if the write actually landed.
    // If it failed (e.g. migration 026 not applied yet), leave STATE_UPDATED_AT
    // absent so local keeps winning — no data loss, just no persistence.
    if (!error) localStorage.setItem(STATE_UPDATED_AT, now)
  } catch {
    // Silently fail — localStorage remains the source of truth.
  }
}

/**
 * Persist local state to Supabase (debounced). Fire-and-forget.
 */
export function syncToServer(): void {
  if (typeof window === "undefined") return
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flushToServer()
  }, SYNC_DEBOUNCE_MS)
}

/**
 * Restore server state into localStorage on load, using last-write-wins.
 * Returns true if the server's state was adopted.
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

    const localTs = localStorage.getItem(STATE_UPDATED_AT)
    const serverTs = typeof data.updated_at === "string" ? data.updated_at : null

    // Decide who wins. After the first successful sync both sides carry a
    // timestamp, so it's a plain newer-wins comparison. Before that (no local
    // timestamp) fall back to "richer side wins" so we never clobber real local
    // data with a default server row.
    const adopt = localTs
      ? !!serverTs && serverTs > localTs
      : serverIsRicher(data as Record<string, unknown>)

    if (adopt) {
      adoptServer(data as Record<string, unknown>)
      if (serverTs) localStorage.setItem(STATE_UPDATED_AT, serverTs)
      // Tell in-memory contexts (gems) to re-read localStorage immediately.
      window.dispatchEvent(new Event("rally-state-restored"))
      return true
    }

    // Local wins. Push it up if local is strictly ahead (or has never synced),
    // but stay quiet when the two sides already match (avoids a write on every
    // navigation, since initSync runs per route change).
    if (!localTs || (serverTs && localTs > serverTs)) syncToServer()
    return false
  } catch {
    return false
  }
}

/**
 * Initialize sync on app load. Safe to call on every navigation.
 */
export async function initSync(): Promise<void> {
  await syncFromServer()
}

/**
 * Export KEYS for use in migration scripts
 */
export { KEYS as STATE_KEYS }
