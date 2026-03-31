// Local question bank — imported at build time, no Supabase fetch needed
// NOTE: The Supabase client is intentionally NOT imported here.
//       Waitlist inserts and auth use lib/supabase/client.ts directly.

import algebraQuestions from "../public/algebra_v3.json"
import readingQuestions from "../public/reading_v3.json"
import grammarQuestions from "../public/grammar_v3.json"
import dataQuestions from "../public/data_v3.json"

export interface Question {
  id: number
  category: string
  difficulty: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct: string
  explanation: string
}

// Combined bank — built once at module load
const ALL_QUESTIONS: Question[] = [
  ...(algebraQuestions as Question[]),
  ...(readingQuestions as Question[]),
  ...(grammarQuestions as Question[]),
  ...(dataQuestions as Question[]),
]

/**
 * Fetch ONE question for a category + difficulty, excluding already-seen IDs.
 * Falls back to ignoring exclusions if all questions at that difficulty are exhausted.
 */
export function getOneQuestion(
  category: string,
  difficulty: string,
  excludeIds: number[] = []
): Question {
  const excludeSet = new Set(excludeIds)

  // Primary: matching category + difficulty, not yet seen
  let pool = ALL_QUESTIONS.filter(
    q => q.category === category && q.difficulty === difficulty && !excludeSet.has(q.id)
  )

  // Fallback: same category + difficulty but ignore exclusions (all seen — reset)
  if (pool.length === 0) {
    pool = ALL_QUESTIONS.filter(
      q => q.category === category && q.difficulty === difficulty
    )
  }

  // Final fallback: any question in category
  if (pool.length === 0) {
    pool = ALL_QUESTIONS.filter(q => q.category === category)
  }

  if (pool.length === 0) {
    throw new Error("NO_QUESTIONS")
  }

  // Client-side shuffle, pick first
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled[0]
}

/**
 * Legacy batch helper — kept for any call sites that still use it.
 * Returns 5 questions from the local bank, no Supabase involved.
 */
export function getQuestions(
  category: string,
  excludeIds: number[] = [],
  _difficulty?: string | null
): Question[] {
  const excludeSet = new Set(excludeIds)

  let pool = ALL_QUESTIONS.filter(
    q => q.category === category && !excludeSet.has(q.id)
  )

  if (pool.length === 0) {
    pool = ALL_QUESTIONS.filter(q => q.category === category)
  }

  if (pool.length === 0) return []

  return [...pool].sort(() => Math.random() - 0.5).slice(0, 5)
}
