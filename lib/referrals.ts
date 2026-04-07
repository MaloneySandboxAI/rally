"use client"

import { createClient } from "@/lib/supabase/client"
import { GEM_ECONOMY } from "@/lib/gem-context"

const REFERRAL_CODE_KEY = "rally_referral_code"
const PENDING_REFERRAL_KEY = "rally_pending_referral"

// Store a referral code from URL params so we can use it after signup
export function storePendingReferral(code: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PENDING_REFERRAL_KEY, code)
}

export function getPendingReferral(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(PENDING_REFERRAL_KEY)
}

export function clearPendingReferral(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(PENDING_REFERRAL_KEY)
}

// Cache the user's own referral code locally for fast access
export function cacheReferralCode(code: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(REFERRAL_CODE_KEY, code)
}

export function getCachedReferralCode(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFERRAL_CODE_KEY)
}

// Fetch the current user's referral code from Supabase (and cache it)
export async function fetchMyReferralCode(): Promise<string | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data } = await supabase
    .from("users")
    .select("referral_code")
    .eq("id", session.user.id)
    .single()

  if (data?.referral_code) {
    cacheReferralCode(data.referral_code)
    return data.referral_code
  }
  return null
}

// Build the full referral link
export function getReferralLink(code: string): string {
  if (typeof window === "undefined") return ""
  return `${window.location.origin}/join?ref=${code}`
}

// Process a pending referral after a new user signs up
// Called from setup-profile page after username is saved
export async function processPendingReferral(): Promise<boolean> {
  const referralCode = getPendingReferral()
  if (!referralCode) return false

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return false

  // Look up who owns this referral code
  const { data: referrer } = await supabase
    .from("users")
    .select("id")
    .eq("referral_code", referralCode)
    .single()

  if (!referrer) {
    // Invalid referral code — clean up and move on
    clearPendingReferral()
    return false
  }

  // Don't allow self-referral
  if (referrer.id === session.user.id) {
    clearPendingReferral()
    return false
  }

  // Set referred_by on the new user
  await supabase
    .from("users")
    .update({ referred_by: referrer.id })
    .eq("id", session.user.id)

  // Create referral tracking row (status: pending — completes after first round)
  const { error } = await supabase.from("referrals").insert({
    referrer_id: referrer.id,
    referred_id: session.user.id,
    status: "pending",
  })

  if (error) {
    // Likely duplicate — user was already referred
    console.error("Referral insert error:", error)
  }

  clearPendingReferral()
  return true
}

// Complete a referral and award gems to BOTH users
// Called after the referred user finishes their first round
export async function completeReferralIfPending(
  addGems: (amount: number) => void
): Promise<{ completed: boolean; referrerName?: string }> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { completed: false }

  // Check if this user has a pending referral
  const { data: referral } = await supabase
    .from("referrals")
    .select("id, referrer_id, status")
    .eq("referred_id", session.user.id)
    .eq("status", "pending")
    .single()

  if (!referral) return { completed: false }

  // Award gems to the referred user (me)
  addGems(GEM_ECONOMY.referralBonus)

  // Mark referral as completed
  await supabase
    .from("referrals")
    .update({
      status: "completed",
      gems_awarded: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", referral.id)

  // Award gems to the referrer via a direct gems update
  // We need to read their current balance, add 500, and write back
  // Since gems are in localStorage on the referrer's device, we track it in Supabase
  // and they'll see it next time they load the app
  // For now, store the pending reward in a simple approach: insert a row
  // Actually — gems are client-side (localStorage). Best approach:
  // Store the bonus in Supabase so the referrer picks it up on next load.
  await supabase.from("referrals").update({
    gems_awarded: true,
  }).eq("id", referral.id)

  // Get referrer's username for the toast
  const { data: referrer } = await supabase
    .from("users")
    .select("username")
    .eq("id", referral.referrer_id)
    .single()

  return { completed: true, referrerName: referrer?.username }
}

// Check if there's unclaimed referral bonus for the current user (as referrer)
// Returns total unclaimed bonus gems
export async function checkUnclaimedReferralBonuses(): Promise<number> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return 0

  const { data: completedReferrals } = await supabase
    .from("referrals")
    .select("id")
    .eq("referrer_id", session.user.id)
    .eq("status", "completed")
    .eq("gems_awarded", true)

  // Each completed referral = 500 gems for the referrer
  // We use a separate localStorage key to track which ones they've claimed
  if (!completedReferrals || completedReferrals.length === 0) return 0

  const claimedKey = "rally_claimed_referral_ids"
  const claimed = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem(claimedKey) || "[]")
    : []

  const unclaimed = completedReferrals.filter(r => !claimed.includes(r.id))
  return unclaimed.length * GEM_ECONOMY.referralBonus
}

// Claim referral bonuses for the referrer
export async function claimReferralBonuses(
  addGems: (amount: number) => void
): Promise<number> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return 0

  const { data: completedReferrals } = await supabase
    .from("referrals")
    .select("id")
    .eq("referrer_id", session.user.id)
    .eq("status", "completed")
    .eq("gems_awarded", true)

  if (!completedReferrals || completedReferrals.length === 0) return 0

  const claimedKey = "rally_claimed_referral_ids"
  const claimed: number[] = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem(claimedKey) || "[]")
    : []

  const unclaimed = completedReferrals.filter(r => !claimed.includes(r.id))
  if (unclaimed.length === 0) return 0

  const bonus = unclaimed.length * GEM_ECONOMY.referralBonus
  addGems(bonus)

  // Mark as claimed locally
  const newClaimed = [...claimed, ...unclaimed.map(r => r.id)]
  if (typeof window !== "undefined") {
    localStorage.setItem(claimedKey, JSON.stringify(newClaimed))
  }

  return bonus
}

// Get referral stats for display
export async function getReferralStats(): Promise<{
  totalReferred: number
  completedReferrals: number
  pendingReferrals: number
  totalGemsEarned: number
}> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { totalReferred: 0, completedReferrals: 0, pendingReferrals: 0, totalGemsEarned: 0 }

  const { data: referrals } = await supabase
    .from("referrals")
    .select("status")
    .eq("referrer_id", session.user.id)

  if (!referrals) return { totalReferred: 0, completedReferrals: 0, pendingReferrals: 0, totalGemsEarned: 0 }

  const completed = referrals.filter(r => r.status === "completed").length
  const pending = referrals.filter(r => r.status === "pending").length

  return {
    totalReferred: referrals.length,
    completedReferrals: completed,
    pendingReferrals: pending,
    totalGemsEarned: completed * GEM_ECONOMY.referralBonus,
  }
}
