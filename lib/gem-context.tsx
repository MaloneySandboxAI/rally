"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

// ─── Storage Keys ────────────────────────────────────────────────────────────
const GEMS_KEY          = "rally_gems"
const HEARTS_KEY        = "rally_hearts"
const HEARTS_DATE_KEY   = "rally_hearts_date"
const STREAK_KEY        = "rally_streak"
const LAST_PLAYED_KEY   = "rally_last_played"
const LAST_LOGIN_KEY    = "rally_last_login"
const IS_PRO_KEY        = "rally_is_pro"
const ROUNDS_TODAY_KEY  = "rally_rounds_today"
const ROUNDS_DATE_KEY   = "rally_rounds_today_date"

// ─── Constants ───────────────────────────────────────────────────────────────
export const DAILY_HEARTS      = 5
export const MAX_SOLO_ROUNDS   = 3
export const DAILY_LOGIN_BONUS = 30
export const STARTING_BALANCE  = 300
export const HEARTS_REFILL_COST = 200

// ─── Gem values by difficulty ─────────────────────────────────────────────
export const GEM_VALUES = {
  solo: {
    easy:   10,
    medium: 20,
    hard:   40,
  },
  challenge: {
    easy:   40,  // 4x multiplier
    medium: 80,
    hard:   160,
  },
  speedMultiplier: 1.5,
  challengeWin:    150,
  challengeLoss:   25,
  challengeTie:    75,
  streakBonus7:    100,
  streakBonus30:   500,
  refBonus:        500,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function gemsForAnswer(difficulty: string, isChallenge: boolean, isSpeed: boolean): number {
  const tier = isChallenge ? GEM_VALUES.challenge : GEM_VALUES.solo
  const base = tier[difficulty as keyof typeof tier] as number ?? tier.easy
  return isSpeed ? Math.round(base * GEM_VALUES.speedMultiplier) : base
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0]
}

function readInt(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback
  const v = parseInt(localStorage.getItem(key) ?? String(fallback), 10)
  return isNaN(v) ? fallback : v
}

function readStr(key: string): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(key) ?? ""
}

// ─── Context type ─────────────────────────────────────────────────────────
interface GemContextType {
  totalGems:       number
  hearts:          number
  isPro:           boolean
  roundsToday:     number
  addGems:         (amount: number) => void
  setTotalGems:    (amount: number) => void
  spendGems:       (amount: number) => boolean   // returns false if insufficient
  loseHeart:       () => void
  refillHearts:    () => boolean                 // returns false if can't afford
  canPlaySolo:     () => boolean
  incrementRoundsToday: () => void
}

const GemContext = createContext<GemContextType | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────
export function GemProvider({ children }: { children: ReactNode }) {
  const [totalGems, setTotalGemsState] = useState<number>(() =>
    readInt(GEMS_KEY, STARTING_BALANCE)
  )
  const [hearts, setHeartsState] = useState<number>(() => {
    const date = readStr(HEARTS_DATE_KEY)
    if (date !== todayStr()) return DAILY_HEARTS   // new day — full hearts
    return readInt(HEARTS_KEY, DAILY_HEARTS)
  })
  const [isPro] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(IS_PRO_KEY) === "true"
  })
  const [roundsToday, setRoundsTodayState] = useState<number>(() => {
    const date = readStr(ROUNDS_DATE_KEY)
    if (date !== todayStr()) return 0
    return readInt(ROUNDS_TODAY_KEY, 0)
  })

  // Persist gems
  useEffect(() => { localStorage.setItem(GEMS_KEY, totalGems.toString()) }, [totalGems])

  // Persist hearts + date
  useEffect(() => {
    localStorage.setItem(HEARTS_KEY, hearts.toString())
    localStorage.setItem(HEARTS_DATE_KEY, todayStr())
  }, [hearts])

  // Persist rounds today
  useEffect(() => {
    localStorage.setItem(ROUNDS_TODAY_KEY, roundsToday.toString())
    localStorage.setItem(ROUNDS_DATE_KEY, todayStr())
  }, [roundsToday])

  // Daily login bonus — once per calendar day
  useEffect(() => {
    const today = todayStr()
    const lastLogin = readStr(LAST_LOGIN_KEY)
    if (lastLogin !== today) {
      localStorage.setItem(LAST_LOGIN_KEY, today)
      setTotalGemsState(prev => prev + DAILY_LOGIN_BONUS)
    }
  }, [])

  const addGems = useCallback((amount: number) => {
    setTotalGemsState(prev => prev + amount)
  }, [])

  const setTotalGems = useCallback((amount: number) => {
    setTotalGemsState(amount)
  }, [])

  const spendGems = useCallback((amount: number): boolean => {
    let canSpend = false
    setTotalGemsState(prev => {
      if (prev >= amount) { canSpend = true; return prev - amount }
      return prev
    })
    return canSpend
  }, [])

  const loseHeart = useCallback(() => {
    setHeartsState(prev => Math.max(0, prev - 1))
  }, [])

  const refillHearts = useCallback((): boolean => {
    let success = false
    setTotalGemsState(prev => {
      if (prev >= HEARTS_REFILL_COST) {
        success = true
        return prev - HEARTS_REFILL_COST
      }
      return prev
    })
    if (success) setHeartsState(DAILY_HEARTS)
    return success
  }, [])

  const canPlaySolo = useCallback((): boolean => {
    if (isPro) return true
    if (hearts <= 0) return false
    if (roundsToday >= MAX_SOLO_ROUNDS) return false
    return true
  }, [isPro, hearts, roundsToday])

  const incrementRoundsToday = useCallback(() => {
    setRoundsTodayState(prev => prev + 1)
  }, [])

  return (
    <GemContext.Provider value={{
      totalGems, hearts, isPro, roundsToday,
      addGems, setTotalGems, spendGems,
      loseHeart, refillHearts, canPlaySolo, incrementRoundsToday,
    }}>
      {children}
    </GemContext.Provider>
  )
}

// ─── Streak tracking (pure localStorage, no context needed) ───────────────
export function markRoundCompleted(): void {
  if (typeof window === "undefined") return
  const today = todayStr()
  const lastPlayed = readStr(LAST_PLAYED_KEY)
  const currentStreak = readInt(STREAK_KEY, 0)
  if (lastPlayed === today) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = yesterday.toISOString().split("T")[0]
  const newStreak = lastPlayed === yStr ? currentStreak + 1 : 1

  localStorage.setItem(LAST_PLAYED_KEY, today)
  localStorage.setItem(STREAK_KEY, newStreak.toString())

  // Streak bonuses
  if (newStreak === 7) {
    const gems = readInt(GEMS_KEY, 0)
    localStorage.setItem(GEMS_KEY, (gems + GEM_VALUES.streakBonus7).toString())
  } else if (newStreak === 30) {
    const gems = readInt(GEMS_KEY, 0)
    localStorage.setItem(GEMS_KEY, (gems + GEM_VALUES.streakBonus30).toString())
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useGems() {
  const ctx = useContext(GemContext)
  if (!ctx) throw new Error("useGems must be used within GemProvider")
  return ctx
}

// ─── Legacy helper kept for ResultsScreen compatibility ───────────────────
export const calculateRoundGems = (
  _correct: number,
  _total: number,
  _isChallenge: boolean,
  _didWin?: boolean
): { total: number; breakdown: { label: string; amount: number }[] } => ({
  total: 0,
  breakdown: [],
})
