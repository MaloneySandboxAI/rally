"use client"

import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ykxlushgytgfbdigroit.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreGx1c2hneXRnZmJkaWdyb2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzA0NDQsImV4cCI6MjA4OTM0NjQ0NH0.75TiKhtFEIsfrm1WS5eVAn9nIodgqbLng5lOS4nT8CI"

let supabaseInstance: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey)
  }
  return supabaseInstance
}

// Generate a short, unique share code (6 chars, alphanumeric)
function generateShareCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789" // no confusing chars (0/O, 1/l, i)
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export interface ChallengeResult {
  questionIndex: number
  isCorrect: boolean
  difficulty: string
  wasSpeedBonus: boolean
  gemsEarned: number
  chosenAnswerIndex: number | null
}

export interface ChallengePool {
  easy: number[]
  medium: number[]
  hard: number[]
}

export interface Challenge {
  id: number
  share_code: string
  category: string
  question_ids: number[] // flat array: [5 easy, 5 medium, 5 hard] — use poolFromFlat() to reconstruct
  creator_name: string
  creator_score: number // gems earned (-1 = hasn't played yet)
  creator_results: ChallengeResult[] | null
  challenger_name: string | null
  challenger_score: number | null // gems earned
  challenger_results: ChallengeResult[] | null
  status: "pending" | "completed"
  created_at: string
  completed_at: string | null
}

/** Flatten a pool into [easy0..4, medium0..4, hard0..4] for DB storage */
export function poolToFlat(pool: ChallengePool): number[] {
  return [...pool.easy, ...pool.medium, ...pool.hard]
}

/** Reconstruct a pool from a flat array [easy0..4, medium0..4, hard0..4] */
export function poolFromFlat(flat: number[]): ChallengePool {
  return {
    easy: flat.slice(0, 5),
    medium: flat.slice(5, 10),
    hard: flat.slice(10, 15),
  }
}

/**
 * Create a new challenge BEFORE the creator plays.
 * Stores a shared question pool (5 easy + 5 medium + 5 hard).
 * Both players draw from this pool based on their adaptive path,
 * so if both reach medium on Q3, they get the same medium question.
 * Score = total gems earned (not correct count).
 */
export async function createChallenge(params: {
  category: string
  creatorName: string
  questionPool: ChallengePool
}): Promise<string | null> {
  if (typeof window === "undefined") return null
  const supabase = getSupabase()

  for (let attempt = 0; attempt < 3; attempt++) {
    const shareCode = generateShareCode()

    const { error } = await supabase.from("challenges").insert({
      share_code: shareCode,
      category: params.category,
      question_ids: poolToFlat(params.questionPool), // [5 easy, 5 medium, 5 hard]
      creator_name: params.creatorName,
      creator_score: -1, // sentinel: hasn't played yet
      creator_results: null,
      status: "pending",
    })

    if (!error) {
      return shareCode
    }

    if (error.code === "23505") continue
    console.error("[rally] Error creating challenge:", error)
    return null
  }

  return null
}

/**
 * Update the creator's results after they finish their adaptive round.
 * Score = total gems earned.
 */
export async function updateCreatorResults(params: {
  shareCode: string
  creatorScore: number
  creatorResults: ChallengeResult[]
}): Promise<boolean> {
  if (typeof window === "undefined") return false
  const supabase = getSupabase()

  const { error } = await supabase
    .from("challenges")
    .update({
      creator_score: params.creatorScore,
      creator_results: params.creatorResults,
    })
    .eq("share_code", params.shareCode)
    .eq("creator_score", -1)

  if (error) {
    console.error("[rally] Error updating creator results:", error)
    return false
  }

  return true
}

/**
 * Look up a challenge by its share code.
 */
export async function getChallenge(shareCode: string): Promise<Challenge | null> {
  if (typeof window === "undefined") return null
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("share_code", shareCode)
    .single()

  if (error || !data) {
    console.error("[rally] Error fetching challenge:", error)
    return null
  }

  return data as Challenge
}

/**
 * Submit the challenger's results to complete the challenge.
 * Score = total gems earned.
 */
export async function completeChallenge(params: {
  shareCode: string
  challengerName: string
  challengerScore: number
  challengerResults: ChallengeResult[]
}): Promise<boolean> {
  if (typeof window === "undefined") return false
  const supabase = getSupabase()

  const { error } = await supabase
    .from("challenges")
    .update({
      challenger_name: params.challengerName,
      challenger_score: params.challengerScore,
      challenger_results: params.challengerResults,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("share_code", params.shareCode)
    .eq("status", "pending")

  if (error) {
    console.error("[rally] Error completing challenge:", error)
    return false
  }

  return true
}

/**
 * Build the full share URL for a challenge.
 */
export function getChallengeUrl(shareCode: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://rallyplaylive.com"
  return `${origin}/challenge/${shareCode}`
}
