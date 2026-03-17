"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

// Gem earning values
export const GEM_VALUES = {
  solo: {
    correctAnswer: 25,
    roundCompletion: 50,
    perfectRound: 100, // instead of roundCompletion
  },
  challenge: {
    correctAnswer: 100,
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
  // In a real app, this would be loaded from a database/localStorage
  const [totalGems, setTotalGems] = useState(1250)

  const addGems = useCallback((amount: number) => {
    setTotalGems((prev) => prev + amount)
  }, [])

  return (
    <GemContext.Provider value={{ totalGems, addGems, setTotalGems }}>
      {children}
    </GemContext.Provider>
  )
}

export function useGems() {
  const context = useContext(GemContext)
  if (!context) {
    throw new Error("useGems must be used within a GemProvider")
  }
  return context
}

// Calculate gems earned for a round
export function calculateRoundGems(
  correctAnswers: number,
  totalQuestions: number,
  isChallenge: boolean,
  didWin?: boolean
): { total: number; breakdown: { label: string; amount: number }[] } {
  const values = isChallenge ? GEM_VALUES.challenge : GEM_VALUES.solo
  const breakdown: { label: string; amount: number }[] = []
  let total = 0

  // Correct answers
  const answerGems = correctAnswers * (isChallenge ? GEM_VALUES.challenge.correctAnswer : GEM_VALUES.solo.correctAnswer)
  breakdown.push({
    label: `${correctAnswers} correct answer${correctAnswers !== 1 ? "s" : ""}`,
    amount: answerGems,
  })
  total += answerGems

  if (isChallenge) {
    // Participation bonus
    breakdown.push({
      label: "completion bonus",
      amount: GEM_VALUES.challenge.participationBonus,
    })
    total += GEM_VALUES.challenge.participationBonus

    // Win bonus
    if (didWin) {
      if (correctAnswers === totalQuestions) {
        // Perfect round win
        breakdown.push({
          label: "perfect round bonus",
          amount: GEM_VALUES.challenge.perfectRound,
        })
        total += GEM_VALUES.challenge.perfectRound
      } else {
        // Regular win
        breakdown.push({
          label: "round win bonus",
          amount: GEM_VALUES.challenge.roundWin,
        })
        total += GEM_VALUES.challenge.roundWin
      }
    }
  } else {
    // Solo completion bonus
    if (correctAnswers === totalQuestions) {
      // Perfect round
      breakdown.push({
        label: "perfect round bonus",
        amount: GEM_VALUES.solo.perfectRound,
      })
      total += GEM_VALUES.solo.perfectRound
    } else {
      // Regular completion
      breakdown.push({
        label: "completion bonus",
        amount: GEM_VALUES.solo.roundCompletion,
      })
      total += GEM_VALUES.solo.roundCompletion
    }
  }

  return { total, breakdown }
}
