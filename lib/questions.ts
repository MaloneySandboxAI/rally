import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ykxlushgytgfbdigroit.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreGx1c2hneXRnZmJkaWdyb2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzA0NDQsImV4cCI6MjA4OTM0NjQ0NH0.75TiKhtFEIsfrm1WS5eVAn9nIodgqbLng5lOS4nT8CI"

const supabase = createClient(supabaseUrl, supabaseKey)

export interface Question {
  id: number
  category: string
  difficulty: string
  question: string
  options: string[]
  correct: string
  explanation: string
}

export async function getQuestions(category: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("sat_questions")
    .select("*")
    .eq("category", category)
    .order("id", { ascending: false }) // Use a column that exists, randomness comes from LIMIT on varying data
    .limit(5)

  if (error) {
    console.error("[v0] Supabase fetch error:", error)
    throw new Error("couldn't load questions — check your connection and try again")
  }

  if (!data || data.length === 0) {
    throw new Error("couldn't load questions — check your connection and try again")
  }

  // Shuffle the results client-side for randomness
  const shuffled = [...data].sort(() => Math.random() - 0.5)

  return shuffled as Question[]
}
