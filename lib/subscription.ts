import { createClient } from "@/lib/supabase/client"

export type SubscriptionStatus = "free" | "trialing" | "active" | "past_due" | "canceled"

export interface UserSubscription {
  subscriptionStatus: SubscriptionStatus
  isPremium: boolean
  subscriptionPeriod: "monthly" | "annual" | null
  currentPeriodEndsAt: string | null
  trialEndsAt: string | null
  dailyGemsEarned: number
  dailyGemsResetAt: string | null
  stripeCustomerId: string | null
}

const DAILY_GEM_CAP = 100

/**
 * Fetch the current user's subscription status from Supabase.
 * Returns null if user is not logged in or is a guest.
 */
export async function getUserSubscription(): Promise<UserSubscription | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data: user } = await supabase
    .from("users")
    .select("subscription_status, subscription_period, current_period_ends_at, trial_ends_at, daily_gems_earned, daily_gems_reset_at, stripe_customer_id")
    .eq("id", session.user.id)
    .single()

  if (!user) {
    // User row doesn't exist yet — treat as free
    return {
      subscriptionStatus: "free",
      isPremium: false,
      subscriptionPeriod: null,
      currentPeriodEndsAt: null,
      trialEndsAt: null,
      dailyGemsEarned: 0,
      dailyGemsResetAt: null,
      stripeCustomerId: null,
    }
  }

  const status = (user.subscription_status || "free") as SubscriptionStatus
  const isPremium = ["active", "trialing"].includes(status)

  return {
    subscriptionStatus: status,
    isPremium,
    subscriptionPeriod: user.subscription_period,
    currentPeriodEndsAt: user.current_period_ends_at,
    trialEndsAt: user.trial_ends_at,
    dailyGemsEarned: user.daily_gems_earned ?? 0,
    dailyGemsResetAt: user.daily_gems_reset_at,
    stripeCustomerId: user.stripe_customer_id,
  }
}

/**
 * Check if a free user has hit the daily gem cap.
 * Returns { capped, remaining, earned }.
 */
export function checkDailyGemCap(sub: UserSubscription): {
  capped: boolean
  remaining: number
  earned: number
} {
  if (sub.isPremium) {
    return { capped: false, remaining: Infinity, earned: 0 }
  }

  const today = new Date().toISOString().split("T")[0]
  const isNewDay = sub.dailyGemsResetAt !== today
  const earned = isNewDay ? 0 : sub.dailyGemsEarned
  const remaining = Math.max(0, DAILY_GEM_CAP - earned)

  return {
    capped: remaining === 0,
    remaining,
    earned,
  }
}

export const PREMIUM_CONFIG = {
  dailyGemCap: DAILY_GEM_CAP,
  monthlyPrice: 6,
  annualPrice: 50,
  trialDays: 7,
}
