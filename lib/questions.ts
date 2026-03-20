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
  difficulty?: string | null
): Promise<Question[]> {
  if (typeof window === "undefined") return []

  const supabase = getSupabase()

  let query = supabase
    .from("sat_questions")
    .select("*")
    .eq("category", category)

  // Only apply difficulty filter when explicitly provided
  if (difficulty) {
    query = query.eq("difficulty", difficulty)
  }

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
