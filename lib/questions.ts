"use client"

// Local question bank — loaded via fetch from /public at runtime.
// No Supabase client here; auth uses lib/supabase/client.ts directly.

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

// In-memory cache populated by initQuestions()
let ALL_QUESTIONS: Question[] = []
let initPromise: Promise<void> | null = null

/**
 * Load all four question banks from /public once and cache them.
 * Safe to call multiple times — subsequent calls return the same promise.
 */
export async function initQuestions(): Promise<void> {
  if (ALL_QUESTIONS.length > 0) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    const [alg, read, gram, dat] = await Promise.all([
      fetch("/algebra_v3.json").then(r => r.json()),
      fetch("/reading_v3.json").then(r => r.json()),
      fetch("/grammar_v3.json").then(r => r.json()),
      fetch("/data_v3.json").then(r => r.json()),
    ])
    ALL_QUESTIONS = [...alg, ...read, ...gram, ...dat] as Question[]
  })()

  return initPromise
}

/**
 * Synchronously pick ONE question after initQuestions() has resolved.
 * Falls back through difficulty → all-in-category if pool is exhausted.
 */
export function getOneQuestion(
  category: string,
  difficulty: string,
  excludeIds: number[] = []
): Question {
  const excludeSet = new Set(excludeIds)

  // Primary: category + difficulty, not yet seen
  let pool = ALL_QUESTIONS.filter(
    q => q.category === category && q.difficulty === difficulty && !excludeSet.has(q.id)
  )

  // Fallback 1: same category + difficulty, ignore exclusions (reset)
  if (pool.length === 0) {
    pool = ALL_QUESTIONS.filter(q => q.category === category && q.difficulty === difficulty)
  }

  // Fallback 2: any question in category
  if (pool.length === 0) {
    pool = ALL_QUESTIONS.filter(q => q.category === category)
  }

  if (pool.length === 0) throw new Error("NO_QUESTIONS")

  return [...pool].sort(() => Math.random() - 0.5)[0]
}

/**
 * Legacy batch helper — returns 5 questions from the local bank.
 */
export function getQuestions(
  category: string,
  excludeIds: number[] = [],
  _difficulty?: string | null
): Question[] {
  const excludeSet = new Set(excludeIds)

  let pool = ALL_QUESTIONS.filter(q => q.category === category && !excludeSet.has(q.id))
  if (pool.length === 0) pool = ALL_QUESTIONS.filter(q => q.category === category)
  if (pool.length === 0) return []

  return [...pool].sort(() => Math.random() - 0.5).slice(0, 5)
}
