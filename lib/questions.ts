"use client"

import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = "https://rmbzpxvsejbugsgflqsv.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYnpweHZzZWpidWdzZ2ZscXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzU2MDEsImV4cCI6MjA5MDgxMTYwMX0.nyDqyCJ0PD42xImxrwY6GbbsfClQMWH_UTHDGvMdfZM"

// Singleton to prevent multiple GoTrueClient instances during HMR
let supabaseInstance: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey)
  }
  return supabaseInstance
}

export interface Question {
  id: number
  category: string
  difficulty: string
  subtopic?: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct: string
  explanation: string
}

// Total questions per category — used to know when to reset the used-IDs set
const CATEGORY_TOTAL = 100

export async function getQuestions(
  category: string,
  excludeIds: number[] = [],
  // difficulty param kept for API compatibility but intentionally NOT used in query
  _difficulty?: string | null
): Promise<Question[]> {
  if (typeof window === "undefined") return []

  const supabase = getSupabase()

  // Query: SELECT * FROM sat_questions WHERE category = ? AND id NOT IN (...) LIMIT 20
  // NO difficulty filter — all difficulties are fetched together
  let query = supabase
    .from("sat_questions")
    .select("*")
    .eq("category", category)

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`)
  }

  const { data, error } = await query.limit(20)

  if (error) {
    console.error("[v0] Supabase fetch error:", error)
    throw new Error("couldn't load questions — check your connection and try again")
  }

  if (!data || data.length === 0) {
    throw new Error("RESET_NEEDED")
  }

  const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 5)
  return shuffled as Question[]
}

/**
 * Fetch a SINGLE question filtered by difficulty.
 * Used for within-round adaptive difficulty: start easy, bump up on correct, drop on wrong.
 * Falls back to any difficulty if no questions match the requested level.
 */
export async function getOneQuestion(
  category: string,
  difficulty: string,
  excludeIds: number[] = [],
  subtopic?: string | null
): Promise<Question | null> {
  if (typeof window === "undefined") return null

  const supabase = getSupabase()

  let query = supabase
    .from("sat_questions")
    .select("*")
    .eq("category", category)
    .eq("difficulty", difficulty)

  if (subtopic) {
    query = query.eq("subtopic", subtopic)
  }

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`)
  }

  const { data, error } = await query.limit(10)

  if (error) {
    console.error("[v0] Supabase single-question fetch error:", error)
    return null
  }

  if (!data || data.length === 0) {
    // Fallback: try fetching ANY difficulty if requested one has no remaining questions
    let fallbackQuery = supabase
      .from("sat_questions")
      .select("*")
      .eq("category", category)

    if (subtopic) {
      fallbackQuery = fallbackQuery.eq("subtopic", subtopic)
    }

    if (excludeIds.length > 0) {
      fallbackQuery = fallbackQuery.not("id", "in", `(${excludeIds.join(",")})`)
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery.limit(10)

    if (fallbackError || !fallbackData || fallbackData.length === 0) {
      return null
    }

    const shuffled = [...fallbackData].sort(() => Math.random() - 0.5)
    return shuffled[0] as Question
  }

  const shuffled = [...data].sort(() => Math.random() - 0.5)
  return shuffled[0] as Question
}

/**
 * Fetch specific questions by their IDs (used for challenge mode).
 * Returns them in the same order as the provided IDs array.
 */
export async function getQuestionsByIds(ids: number[]): Promise<Question[]> {
  if (typeof window === "undefined" || ids.length === 0) return []

  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("sat_questions")
    .select("*")
    .in("id", ids)

  if (error || !data) {
    console.error("[rally] Error fetching questions by IDs:", error)
    return []
  }

  // Return in the same order as the input IDs
  const map = new Map(data.map(q => [q.id, q]))
  return ids.map(id => map.get(id)).filter(Boolean) as Question[]
}

/**
 * Fetch a challenge question pool: 5 easy + 5 medium + 5 hard for a category.
 * Returns { easy: id[], medium: id[], hard: id[] }.
 * Both players draw from this shared pool based on their adaptive path,
 * so if both reach medium on question 3, they get the same medium question.
 */
export async function getChallengePool(
  category: string
): Promise<{ easy: number[]; medium: number[]; hard: number[] } | null> {
  if (typeof window === "undefined") return null

  const supabase = getSupabase()

  // Fetch all three difficulties in parallel
  const [easyRes, medRes, hardRes] = await Promise.all([
    supabase.from("sat_questions").select("id").eq("category", category).eq("difficulty", "easy").limit(15),
    supabase.from("sat_questions").select("id").eq("category", category).eq("difficulty", "medium").limit(15),
    supabase.from("sat_questions").select("id").eq("category", category).eq("difficulty", "hard").limit(15),
  ])

  if (easyRes.error || medRes.error || hardRes.error) {
    console.error("[rally] Error fetching challenge pool:", easyRes.error, medRes.error, hardRes.error)
    return null
  }

  // Shuffle each set and take 5
  const shuffle = (arr: { id: number }[]) =>
    [...arr].sort(() => Math.random() - 0.5).slice(0, 5).map(q => q.id)

  const easy = shuffle(easyRes.data || [])
  const medium = shuffle(medRes.data || [])
  const hard = shuffle(hardRes.data || [])

  if (easy.length === 0 && medium.length === 0 && hard.length === 0) {
    return null
  }

  return { easy, medium, hard }
}

/**
 * Fetch one random question per subtopic for the diagnostic test.
 * Returns questions in category order (Algebra → Reading → Grammar → Data & Stats).
 */
export async function getDiagnosticQuestions(
  subtopics: { category: string; id: string }[]
): Promise<Question[]> {
  if (typeof window === "undefined") return []

  const supabase = getSupabase()
  const questions: Question[] = []

  // Fetch one question per subtopic — run in small parallel batches
  const batchSize = 6
  for (let i = 0; i < subtopics.length; i += batchSize) {
    const batch = subtopics.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(async ({ category, id }) => {
        const { data, error } = await supabase
          .from("sat_questions")
          .select("*")
          .eq("category", category)
          .eq("subtopic", id)
          .limit(5)

        if (error || !data || data.length === 0) return null
        // Pick one randomly
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        return shuffled[0] as Question
      })
    )
    for (const q of results) {
      if (q) questions.push(q)
    }
  }

  return questions
}

/**
 * Fetch a single question for a specific subtopic + difficulty.
 * Used for drilling weak subtopics from diagnostic results.
 */
export async function getSubtopicQuestion(
  category: string,
  subtopic: string,
  difficulty: string,
  excludeIds: number[] = []
): Promise<Question | null> {
  if (typeof window === "undefined") return null

  const supabase = getSupabase()

  let query = supabase
    .from("sat_questions")
    .select("*")
    .eq("category", category)
    .eq("subtopic", subtopic)
    .eq("difficulty", difficulty)

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`)
  }

  const { data, error } = await query.limit(10)

  if (error || !data || data.length === 0) {
    // Fallback: any difficulty in this subtopic
    let fallback = supabase
      .from("sat_questions")
      .select("*")
      .eq("category", category)
      .eq("subtopic", subtopic)

    if (excludeIds.length > 0) {
      fallback = fallback.not("id", "in", `(${excludeIds.join(",")})`)
    }

    const { data: fbData } = await fallback.limit(10)
    if (!fbData || fbData.length === 0) return null
    return [...fbData].sort(() => Math.random() - 0.5)[0] as Question
  }

  return [...data].sort(() => Math.random() - 0.5)[0] as Question
}
