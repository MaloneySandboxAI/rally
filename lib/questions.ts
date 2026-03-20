"use client"

import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ykxlushgytgfbdigroit.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreGx1c2hneXRnZmJkaWdyb2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzA0NDQsImV4cCI6MjA4OTM0NjQ0NH0.75TiKhtFEIsfrm1WS5eVAn9nIodgqbLng5lOS4nT8CI"

// Singleton — one client for the whole session
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

/**
 * Fetch ONE question for a category + difficulty, excluding already-seen IDs.
 * Query: SELECT * FROM sat_questions
 *        WHERE category = $category
 *          AND difficulty = $difficulty
 *          AND id NOT IN ($excludeIds)
 *        ORDER BY RANDOM()
 *        LIMIT 1
 * If none found at that difficulty (all seen), retries without the excludeIds filter.
 */
export async function getOneQuestion(
  category: string,
  difficulty: string,
  excludeIds: number[] = []
): Promise<Question> {
  if (typeof window === "undefined") throw new Error("server-side call")

  const supabase = getSupabase()

  let query = supabase
    .from("sat_questions")
    .select("*")
    .eq("category", category)
    .eq("difficulty", difficulty)

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`)
  }

  // Use random ordering via a random offset trick — Supabase doesn't expose ORDER BY RANDOM() directly
  // so we fetch up to 20 and shuffle client-side
  const { data, error } = await query.limit(20)

  if (error) {
    console.error("[v0] Supabase error in getOneQuestion:", error.message)
    throw new Error("fetch_failed")
  }

  if (!data || data.length === 0) {
    // No unseen questions at this difficulty — retry without exclusion list
    if (excludeIds.length > 0) {
      return getOneQuestion(category, difficulty, [])
    }
    throw new Error("NO_QUESTIONS")
  }

  // Shuffle and pick one
  const shuffled = [...data].sort(() => Math.random() - 0.5)
  return shuffled[0] as Question
}

/**
 * Legacy batch fetch — kept for compatibility.
 * Fetches 5 questions: NO difficulty filter, excludes seen IDs.
 * Query: SELECT * FROM sat_questions WHERE category = ? AND id NOT IN (...) LIMIT 20
 */
export async function getQuestions(
  category: string,
  excludeIds: number[] = [],
  _difficulty?: string | null
): Promise<Question[]> {
  if (typeof window === "undefined") return []

  const supabase = getSupabase()

  // Absolutely no difficulty filter anywhere in this query
  let query = supabase
    .from("sat_questions")
    .select("*")
    .eq("category", category)

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`)
  }

  const { data, error } = await query.limit(20)

  if (error) {
    console.error("[v0] Supabase error in getQuestions:", error.message)
    throw new Error("couldn't load questions — check your connection and try again")
  }

  if (!data || data.length === 0) {
    throw new Error("RESET_NEEDED")
  }

  const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 5)
  return shuffled as Question[]
}
