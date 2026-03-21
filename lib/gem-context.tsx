"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

const STORAGE_KEY = "rally_gems"

// Gem earning values — tiered by difficulty
// Speed bonus = 1.5x multiplier (answer in <= half allotted time)
export const GEM_VALUES = {
  solo: {
    easy: 10,
    medium: 20,
    hard: 40,
  },
  challenge: {
    easy: 40,
    medium: 80,
    hard: 160,
  },
  challengeOutcome: {
    win: 150,
    loss: 25,   // participation
    tie: 75,
  },
  speedMultiplier: 1.5,
}

// Helper: gems for a single correct answer based on difficulty and mode
export function gemsForAnswer(difficulty: string, isChallenge: boolean, isSpeedBonus: boolean): number {
  const mode = isChallenge ? GEM_VALUES.challenge : GEM_VALUES.solo
  const base = mode[difficulty as keyof typeof mode] ?? mode.easy
  return Math.round(isSpeedBonus ? base * GEM_VALUES.speedMultiplier : base)
}

interface GemContextType {
  totalGems: number
  addGems: (amount: number) => void
  setTotalGems: (amount: number) => void
}

const GemContext = createContext<GemContextType | undefined>(undefined)

export function GemProvider({ children }: { children: ReactNode }) {
  // Lazy initializer reads localStorage only once on first render (client-side only)
  // Default to 300 gems for new accounts (per game design spec)
  const [totalGems, setTotalGemsState] = useState<number>(() => {
    if (typeof window === "undefined") return 300
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return 300 // new user starting balance
    const parsed = parseInt(stored, 10)
    return isNaN(parsed) ? 300 : parsed
  })

  // Persist every gem change to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, totalGems.toString())
  }, [totalGems])

  const addGems = useCallback((amount: number) => {
    setTotalGemsState((prev) => prev + amount)
  }, [])

  const setTotalGems = useCallback((amount: number) => {
    setTotalGemsState(amount)
  }, [])

  return (
    <GemContext.Provider value={{ totalGems, addGems, setTotalGems }}>
      {children}
    </GemContext.Provider>
  )
}

// --- Gem Economy: daily login, streak milestones, streak freeze ---

const LAST_LOGIN_KEY = "rally_last_login"
const STREAK_FREEZE_KEY = "rally_streak_freeze"
const DAILY_LOGIN_BONUS = 30
const STREAK_FREEZE_COST = 150
const STREAK_MILESTONES: Record<number, number> = { 7: 100, 30: 500 }

// Award daily login gems (once per day). Returns amount awarded, or 0 if already claimed.
export function claimDailyLogin(): number {
  if (typeof window === "undefined") return 0
  const today = new Date().toISOString().split("T")[0]
  const lastLogin = localStorage.getItem(LAST_LOGIN_KEY)
  if (lastLogin === today) return 0
  localStorage.setItem(LAST_LOGIN_KEY, today)
  return DAILY_LOGIN_BONUS
}

// Check streak milestones and return bonus amount (0 if no milestone hit)
export function checkStreakMilestone(streak: number): number {
  return STREAK_MILESTONES[streak] ?? 0
}

// Buy a streak freeze so your streak won't break if you miss a day.
// Returns true if purchased. Uses addGems with negative to deduct.
export function buyStreakFreeze(currentGems: number, spendGems: (amount: number) => void): boolean {
  if (currentGems < STREAK_FREEZE_COST) return false
  spendGems(-STREAK_FREEZE_COST)
  localStorage.setItem(STREAK_FREEZE_KEY, "true")
  return true
}

export function hasStreakFreeze(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STREAK_FREEZE_KEY) === "true"
}

export function consumeStreakFreeze(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STREAK_FREEZE_KEY)
}

export const GEM_ECONOMY = {
  dailyLoginBonus: DAILY_LOGIN_BONUS,
  streakFreezeCost: STREAK_FREEZE_COST,
  streakMilestones: STREAK_MILESTONES,
  startingBalance: 300,
  referralBonus: 500,
}

// Mark that a round was completed (for streak tracking)
export function markRoundCompleted() {
  if (typeof window === "undefined") return
  
  const today = new Date().toISOString().split("T")[0]
  const lastPlayed = localStorage.getItem("rally_last_played")
  const currentStreak = parseInt(localStorage.getItem("rally_streak") || "0", 10)
  
  if (lastPlayed === today) {
    // Already played today, no change
    return
  }
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]
  
  let newStreak: number
  if (lastPlayed === yesterdayStr) {
    // Played yesterday, increment streak
    newStreak = currentStreak + 1
  } else if (hasStreakFreeze()) {
    // Missed a day but had a streak freeze — keep streak alive
    consumeStreakFreeze()
    newStreak = currentStreak + 1
  } else {
    // More than 1 day gap, reset to 1 (today counts as day 1)
    newStreak = 1
  }
  
  localStorage.setItem("rally_last_played", today)
  localStorage.setItem("rally_streak", newStreak.toString())
}

export function useGems() {
  const context = useContext(GemContext)
  if (!context) {
    throw new Error("useGems must be used within a GemProvider")
  }
  return context
}

// Calculate gems earned for a round (simplified — uses easy rate as baseline estimate)
export function calculateRoundGems(
  correctAnswers: number,
  _totalQuestions: number,
  isChallenge: boolean,
  _didWin?: boolean
): { total: number; breakdown: { label: string; amount: number }[] } {
  const breakdown: { label: string; amount: number }[] = []
  let total = 0

  const perCorrect = isChallenge ? GEM_VALUES.challenge.easy : GEM_VALUES.solo.easy
  const answerGems = correctAnswers * perCorrect
  breakdown.push({
    label: `${correctAnswers} correct answer${correctAnswers !== 1 ? "s" : ""}`,
    amount: answerGems,
  })
  total += answerGems

  return { total, breakdown }
}
