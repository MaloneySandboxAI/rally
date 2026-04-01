"use client"

import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ykxlushgytgfbdigroit.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreGx1c2hneXRnZmJkaWdyb2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzA0NDQsImV4cCI6MjA4OTM0NjQ0NH0.75TiKhtFEIsfrm1WS5eVAn9nIodgqbLng5lOS4nT8CI"

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
  excludeIds: number[] = []
): Promise<Question | null> {
  if (typeof window === "undefined") return null

  const supabase = getSupabase()

  let query = supabase
    .from("sat_questions")
    .select("*")
    .eq("category", category)
    .eq("difficulty", difficulty)

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
