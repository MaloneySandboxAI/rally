import { createClient } from "@/lib/supabase/client"

const DAILY_CHALLENGE_KEY = "rally_daily_challenges"
const DAILY_CHALLENGE_DATE_KEY = "rally_daily_challenges_date"
const FREE_DAILY_CHALLENGES = 1

/**
 * Check if the current user can access challenge mode.
 * Premium users: unlimited. Free users: 1 per day.
 * Returns null if no user is logged in.
 */
export async function canAccessChallenges(): Promise<boolean | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data: user } = await supabase
    .from("users")
    .select("subscription_status")
    .eq("id", session.user.id)
    .single()

  // Premium users always have access
  if (user && ["active", "trialing"].includes(user.subscription_status || "")) {
    return true
  }

  // Free users get 1 challenge per day
  return !isDailyChallengeUsed()
}

/**
 * Check how many free challenges remain today.
 */
export function getFreeChallengesRemaining(): number {
  if (typeof window === "undefined") return FREE_DAILY_CHALLENGES
  const today = new Date().toISOString().split("T")[0]
  const storedDate = localStorage.getItem(DAILY_CHALLENGE_DATE_KEY)
  if (storedDate !== today) return FREE_DAILY_CHALLENGES
  const used = parseInt(localStorage.getItem(DAILY_CHALLENGE_KEY) || "0", 10)
  return Math.max(0, FREE_DAILY_CHALLENGES - used)
}

/**
 * Check if today's free challenge has been used.
 */
export function isDailyChallengeUsed(): boolean {
  return getFreeChallengesRemaining() <= 0
}

/**
 * Record that a free user used their daily challenge.
 */
export function useDailyChallenge(): void {
  if (typeof window === "undefined") return
  const today = new Date().toISOString().split("T")[0]
  const storedDate = localStorage.getItem(DAILY_CHALLENGE_DATE_KEY)
  const current = storedDate === today
    ? parseInt(localStorage.getItem(DAILY_CHALLENGE_KEY) || "0", 10)
    : 0
  localStorage.setItem(DAILY_CHALLENGE_DATE_KEY, today)
  localStorage.setItem(DAILY_CHALLENGE_KEY, (current + 1).toString())
}
