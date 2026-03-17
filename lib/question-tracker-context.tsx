"use client"

import { createContext, useContext, useRef, useCallback, ReactNode } from "react"

// Category keys matching the question data
export type CategoryKey = "Algebra" | "Reading Comprehension" | "Grammar" | "Data & Statistics"

interface QuestionTrackerContextType {
  getUsedIds: (category: CategoryKey) => Set<number>
  markQuestionsUsed: (category: CategoryKey, questionIds: number[]) => void
  resetCategory: (category: CategoryKey) => void
  getUsedCount: (category: CategoryKey) => number
}

const QuestionTrackerContext = createContext<QuestionTrackerContextType | undefined>(undefined)

export function QuestionTrackerProvider({ children }: { children: ReactNode }) {
  // Use refs to avoid re-renders and maintain stable references
  const usedQuestionsRef = useRef<Record<CategoryKey, Set<number>>>({
    "Algebra": new Set(),
    "Reading Comprehension": new Set(),
    "Grammar": new Set(),
    "Data & Statistics": new Set(),
  })

  const getUsedIds = useCallback((category: CategoryKey): Set<number> => {
    return usedQuestionsRef.current[category]
  }, [])

  const markQuestionsUsed = useCallback((category: CategoryKey, questionIds: number[]) => {
    questionIds.forEach(id => usedQuestionsRef.current[category].add(id))
  }, [])

  const resetCategory = useCallback((category: CategoryKey) => {
    usedQuestionsRef.current[category] = new Set()
  }, [])

  const getUsedCount = useCallback((category: CategoryKey): number => {
    return usedQuestionsRef.current[category].size
  }, [])

  return (
    <QuestionTrackerContext.Provider value={{ 
      getUsedIds, 
      markQuestionsUsed, 
      resetCategory, 
      getUsedCount 
    }}>
      {children}
    </QuestionTrackerContext.Provider>
  )
}

export function useQuestionTracker() {
  const context = useContext(QuestionTrackerContext)
  if (!context) {
    throw new Error("useQuestionTracker must be used within a QuestionTrackerProvider")
  }
  return context
}
