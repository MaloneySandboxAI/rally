"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getUserSubscription, checkDailyGemCap, PREMIUM_CONFIG, type UserSubscription } from "./subscription"

interface PremiumContextType {
  isPremium: boolean
  isLoading: boolean
  subscription: UserSubscription | null
  dailyGemsRemaining: number
  dailyGemCap: number
  dailyGemsCapped: boolean
  /** Call after awarding gems to update the daily counter client-side */
  recordGemsEarned: (amount: number) => void
  /** Refresh subscription from server */
  refresh: () => Promise<void>
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined)

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dailyGemsEarnedLocal, setDailyGemsEarnedLocal] = useState(0)

  const loadSubscription = async () => {
    try {
      const sub = await getUserSubscription()
      setSubscription(sub)
      if (sub) {
        const { earned } = checkDailyGemCap(sub)
        setDailyGemsEarnedLocal(earned)
      }
    } catch {
      // Guest or network error — treat as free
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check localStorage fast-path first for responsiveness
    const isPro = typeof window !== "undefined" && localStorage.getItem("rally_is_pro") === "true"
    if (isPro) {
      // Still load from server but don't block
      setIsLoading(false)
    }
    loadSubscription()
  }, [])

  const isPremium = subscription?.isPremium ?? (typeof window !== "undefined" && localStorage.getItem("rally_is_pro") === "true")

  const cap = checkDailyGemCap(subscription ?? {
    subscriptionStatus: "free",
    isPremium: false,
    subscriptionPeriod: null,
    currentPeriodEndsAt: null,
    trialEndsAt: null,
    dailyGemsEarned: dailyGemsEarnedLocal,
    dailyGemsResetAt: new Date().toISOString().split("T")[0],
    stripeCustomerId: null,
  })

  const recordGemsEarned = (amount: number) => {
    setDailyGemsEarnedLocal(prev => prev + amount)
  }

  return (
    <PremiumContext.Provider value={{
      isPremium,
      isLoading,
      subscription,
      dailyGemsRemaining: isPremium ? Infinity : Math.max(0, PREMIUM_CONFIG.dailyGemCap - dailyGemsEarnedLocal),
      dailyGemCap: PREMIUM_CONFIG.dailyGemCap,
      dailyGemsCapped: !isPremium && dailyGemsEarnedLocal >= PREMIUM_CONFIG.dailyGemCap,
      recordGemsEarned,
      refresh: loadSubscription,
    }}>
      {children}
    </PremiumContext.Provider>
  )
}

export function usePremium() {
  const context = useContext(PremiumContext)
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider")
  }
  return context
}
