"use client"

/**
 * Parent Dashboard — shareable read-only progress view for parents
 *
 * How it works:
 * 1. Premium student taps "share with parent" on their account page
 * 2. A unique token is generated and stored in Supabase (parent_tokens table)
 * 3. Student shares the link (rally.com/parent/[token]) with their parent
 * 4. Parent opens the link — no account needed — sees a progress summary
 * 5. Student can revoke the link anytime from their account page
 *
 * Privacy rules:
 * - Parents see: category levels, streak, activity frequency, challenge mode Y/N
 * - Parents do NOT see: who the student challenged, individual question results,
 *   specific wrong answers, or real-time activity
 */

import { createClient } from "@/lib/supabase/client"

const PARENT_TOKEN_KEY = "rally_parent_token"

/**
 * Generate a random 12-character alphanumeric token
 */
function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < 12; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

/**
 * Create a new parent dashboard token for the current user.
 * Stores in Supabase and returns the token string.
 * If user already has a token, returns the existing one.
 */
export async function createParentToken(): Promise<string | null> {
  if (typeof window === "undefined") return null

  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const userId = session.user.id

    // Check for existing token
    const { data: existing } = await supabase
      .from("parent_tokens")
      .select("token")
      .eq("user_id", userId)
      .single()

    if (existing?.token) {
      localStorage.setItem(PARENT_TOKEN_KEY, existing.token)
      return existing.token
    }

    // Generate new token
    const token = generateToken()
    const displayName = session.user.user_metadata?.display_name
      || session.user.user_metadata?.full_name
      || session.user.user_metadata?.name
      || session.user.email?.split("@")[0]
      || "Student"

    const { error } = await supabase.from("parent_tokens").insert({
      user_id: userId,
      token,
      student_name: displayName,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[rally] Error creating parent token:", error)
      return null
    }

    localStorage.setItem(PARENT_TOKEN_KEY, token)
    return token
  } catch {
    return null
  }
}

/**
 * Get the current user's parent dashboard token (if they have one).
 */
export async function getParentToken(): Promise<string | null> {
  if (typeof window === "undefined") return null

  // Fast path: check localStorage
  const cached = localStorage.getItem(PARENT_TOKEN_KEY)
  if (cached) return cached

  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const { data } = await supabase
      .from("parent_tokens")
      .select("token")
      .eq("user_id", session.user.id)
      .single()

    if (data?.token) {
      localStorage.setItem(PARENT_TOKEN_KEY, data.token)
      return data.token
    }

    return null
  } catch {
    return null
  }
}

/**
 * Revoke (delete) the current user's parent dashboard token.
 */
export async function revokeParentToken(): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return false

    const { error } = await supabase
      .from("parent_tokens")
      .delete()
      .eq("user_id", session.user.id)

    if (error) {
      console.error("[rally] Error revoking parent token:", error)
      return false
    }

    localStorage.removeItem(PARENT_TOKEN_KEY)
    return true
  } catch {
    return false
  }
}

/**
 * Fetch the parent dashboard data for a given token.
 * Called from the public /parent/[token] page — no auth required.
 * Uses a Supabase database function to avoid exposing user data directly.
 */
export interface ParentDashboardData {
  studentName: string
  targetScore: number | null
  // Category levels (average per category)
  categoryLevels: Record<string, number>
  // Subtopic details per category
  subtopicLevels: Record<string, { id: string; label: string; level: number }[]>
  // Activity
  currentStreak: number
  bestStreak: number
  totalGames: number
  totalCorrect: number
  totalQuestions: number
  // Challenge usage (Y/N only, no opponent info)
  hasUsedChallengeMode: boolean
  // Per-category accuracy
  categoryAccuracy: Record<string, { correct: number; total: number }>
  // Last active date
  lastPlayed: string | null
  // Weekly activity (number of days active in last 7 days)
  weeklyActiveDays: number
}

/**
 * Snapshot the current student's progress and save it to the parent_tokens row.
 * Called after each round so the parent dashboard stays fresh.
 * This writes a JSON blob — the parent page reads it without needing
 * access to the student's full user_state.
 */
export async function updateParentSnapshot(): Promise<void> {
  if (typeof window === "undefined") return

  const token = localStorage.getItem(PARENT_TOKEN_KEY)
  if (!token) return // no parent link set up

  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    // Gather data from localStorage (same source as the student sees)
    const stats = JSON.parse(localStorage.getItem("rally_stats") || "{}")
    const subtopicLevels = JSON.parse(localStorage.getItem("rally_subtopic_levels") || "{}")
    const targetScore = localStorage.getItem("rally_target_score")
    const streak = parseInt(localStorage.getItem("rally_streak") || "0", 10)
    const lastPlayed = localStorage.getItem("rally_last_played")

    // Compute category averages from subtopic levels
    const { SUBTOPIC_MAP } = await import("@/lib/diagnostic")
    const categoryLevels: Record<string, number> = {}
    const subtopicDetails: Record<string, { id: string; label: string; level: number }[]> = {}

    for (const [category, subtopics] of Object.entries(SUBTOPIC_MAP)) {
      const levels = subtopics.map(s => {
        const sl = subtopicLevels[s.id]
        return sl?.level || 1
      })
      categoryLevels[category] = levels.length > 0
        ? Math.round((levels.reduce((a: number, b: number) => a + b, 0) / levels.length) * 10) / 10
        : 1
      subtopicDetails[category] = subtopics.map(s => ({
        id: s.id,
        label: s.label,
        level: subtopicLevels[s.id]?.level || 1,
      }))
    }

    // Determine if student has used challenge mode
    const hasUsedChallengeMode = (stats.totalGames || 0) > 0 &&
      typeof localStorage.getItem("rally_challenge_played") === "string"

    // Weekly active days (rough estimate from streak)
    const weeklyActiveDays = Math.min(streak, 7)

    const snapshot: ParentDashboardData = {
      studentName: session.user.user_metadata?.display_name
        || session.user.user_metadata?.full_name
        || session.user.email?.split("@")[0]
        || "Student",
      targetScore: targetScore ? parseInt(targetScore, 10) : null,
      categoryLevels,
      subtopicLevels: subtopicDetails,
      currentStreak: streak,
      bestStreak: stats.bestStreak || 0,
      totalGames: stats.totalGames || 0,
      totalCorrect: stats.totalCorrect || 0,
      totalQuestions: stats.totalQuestions || 0,
      hasUsedChallengeMode,
      categoryAccuracy: stats.byCategory || {},
      lastPlayed,
      weeklyActiveDays,
    }

    await supabase
      .from("parent_tokens")
      .update({ snapshot, updated_at: new Date().toISOString() })
      .eq("token", token)
  } catch {
    // Silent fail — parent snapshot is best-effort
  }
}
