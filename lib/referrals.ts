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

  const { data: referral } = await supabase
    .from("referrals")
    .select("id, referrer_id, status")
    .eq("referred_id", session.user.id)
    .eq("status", "pending")
    .single()

  if (!referral) return { completed: false }

  addGems(GEM_ECONOMY.referralBonus)

  await supabase
    .from("referrals")
    .update({
      status: "completed",
      referred_gems_awarded: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", referral.id)

  // Get referrer's username for the toast
  const { data: referrer } = await supabase
    .from("users")
    .select("username")
    .eq("id", referral.referrer_id)
    .single()

  return { completed: true, referrerName: referrer?.username }
}

// Check unclaimed referral bonuses for the current user (as referrer)
export async function checkUnclaimedReferralBonuses(): Promise<number> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return 0

  const { data } = await supabase
    .from("referrals")
    .select("id")
    .eq("referrer_id", session.user.id)
    .eq("status", "completed")
    .eq("referred_gems_awarded", true)
    .eq("referrer_gems_awarded", false)

  return (data?.length || 0) * GEM_ECONOMY.referralBonus
}

// Claim referral bonuses atomically via RPC (safe across tabs)
export async function claimReferralBonuses(
  addGems: (amount: number) => void
): Promise<number> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return 0

  const { data: claimedCount, error } = await supabase.rpc("claim_referral_bonuses", {
    p_referrer_id: session.user.id,
  })

  if (error || !claimedCount || claimedCount === 0) return 0

  const bonus = claimedCount * GEM_ECONOMY.referralBonus
  addGems(bonus)
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
