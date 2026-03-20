"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

const STORAGE_KEY = "rally_gems"

// Gem earning values
export const GEM_VALUES = {
  solo: {
    correctAnswer: 25,
    correctAnswerSpeed: 38, // 1.5x multiplier rounded (25 * 1.5 = 37.5)
    roundCompletion: 50,
    perfectRound: 100, // instead of roundCompletion
  },
  challenge: {
    correctAnswer: 100,
    correctAnswerSpeed: 150, // 1.5x multiplier
    roundWin: 200,
    perfectRound: 400,
    participationBonus: 50, // win or lose
  },
}

interface GemContextType {
  totalGems: number
  addGems: (amount: number) => void
  setTotalGems: (amount: number) => void
}

const GemContext = createContext<GemContextType | undefined>(undefined)

export function GemProvider({ children }: { children: ReactNode }) {
  const [totalGems, setTotalGemsState] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Load gems from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed)) {
        setTotalGemsState(parsed)
      }
    }
    setIsHydrated(true)
    // Mark initial load as complete after a tick to ensure state is set
    setTimeout(() => setInitialLoadComplete(true), 0)
  }, [])

  // Persist to localStorage whenever gems change (only after initial load is complete)
  useEffect(() => {
    if (initialLoadComplete) {
      localStorage.setItem(STORAGE_KEY, totalGems.toString())
    }
  }, [totalGems, initialLoadComplete])

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

// Calculate gems earned for a round — only correct answers, no completion/perfect bonuses
export function calculateRoundGems(
  correctAnswers: number,
  totalQuestions: number,
  isChallenge: boolean,
  _didWin?: boolean
): { total: number; breakdown: { label: string; amount: number }[] } {
  const breakdown: { label: string; amount: number }[] = []
  let total = 0

  const perCorrect = isChallenge ? GEM_VALUES.challenge.correctAnswer : GEM_VALUES.solo.correctAnswer
  const answerGems = correctAnswers * perCorrect
  breakdown.push({
    label: `${correctAnswers} correct answer${correctAnswers !== 1 ? "s" : ""}`,
    amount: answerGems,
  })
  total += answerGems

  return { total, breakdown }
}
