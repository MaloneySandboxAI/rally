"use client"

import { createClient } from "@/lib/supabase/client"
import { poolToFlat, poolFromFlat, type ChallengePool } from "@/lib/challenges"

function generateGroupCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"
  const randomBytes = new Uint8Array(6)
  crypto.getRandomValues(randomBytes)
  return Array.from(randomBytes, b => chars[b % chars.length]).join("")
}

export interface GroupChallenge {
  id: string
  code: string
  creator_id: string
  creator_name: string
  category: string
  question_ids: number[]
  max_players: number
  status: "active" | "closed"
  created_at: string
  expires_at: string
}

export interface GroupEntry {
  id: string
  group_challenge_id: string
  player_id: string | null
  player_name: string
  score: number
  gems_earned: number
  correct_count: number
  completed_at: string | null
  joined_at: string
}

export async function createGroupChallenge(params: {
  category: string
  creatorName: string
  creatorId: string
  questionPool: ChallengePool
}): Promise<string | null> {
  if (typeof window === "undefined") return null
  const supabase = createClient()

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateGroupCode()

    const { data, error } = await supabase.from("group_challenges").insert({
      code,
      creator_id: params.creatorId,
      creator_name: params.creatorName,
      category: params.category,
      question_ids: poolToFlat(params.questionPool),
    }).select("id").single()

    if (error) {
      if (error.code === "23505") continue
      console.error("[rally] Error creating group challenge:", error)
      return null
    }

    // Auto-join creator
    await supabase.from("group_challenge_entries").insert({
      group_challenge_id: data.id,
      player_id: params.creatorId,
      player_name: params.creatorName,
    })

    return code
  }
  return null
}

export async function getGroupChallenge(code: string): Promise<GroupChallenge | null> {
  if (typeof window === "undefined") return null
  const supabase = createClient()

  const { data, error } = await supabase
    .from("group_challenges")
    .select("*")
    .eq("code", code)
    .single()

  if (error || !data) return null
  return data as GroupChallenge
}

export async function getGroupEntries(groupChallengeId: string): Promise<GroupEntry[]> {
  if (typeof window === "undefined") return []
  const supabase = createClient()

  const { data, error } = await supabase
    .from("group_challenge_entries")
    .select("*")
    .eq("group_challenge_id", groupChallengeId)
    .order("gems_earned", { ascending: false })

  if (error || !data) return []
  return data as GroupEntry[]
}

export async function joinGroupChallenge(params: {
  groupChallengeId: string
  playerId?: string
  playerName: string
}): Promise<boolean> {
  if (typeof window === "undefined") return false
  const supabase = createClient()

  const { error } = await supabase.from("group_challenge_entries").insert({
    group_challenge_id: params.groupChallengeId,
    player_id: params.playerId || null,
    player_name: params.playerName,
  })

  if (error) {
    if (error.code === "23505") return true // already joined
    console.error("[rally] Error joining group challenge:", error)
    return false
  }
  return true
}

export async function submitGroupEntry(params: {
  groupChallengeId: string
  playerId?: string
  playerName: string
  score: number
  gemsEarned: number
  correctCount: number
}): Promise<boolean> {
  if (typeof window === "undefined") return false
  const supabase = createClient()

  let query = supabase
    .from("group_challenge_entries")
    .update({
      score: params.score,
      gems_earned: params.gemsEarned,
      correct_count: params.correctCount,
      completed_at: new Date().toISOString(),
    })
    .eq("group_challenge_id", params.groupChallengeId)

  if (params.playerId) {
    query = query.eq("player_id", params.playerId)
  } else {
    query = query.eq("player_name", params.playerName)
  }

  const { error } = await query
  if (error) {
    console.error("[rally] Error submitting group entry:", error)
    return false
  }
  return true
}

export async function closeGroupChallenge(code: string): Promise<boolean> {
  if (typeof window === "undefined") return false
  const supabase = createClient()

  const { error } = await supabase
    .from("group_challenges")
    .update({ status: "closed" })
    .eq("code", code)

  if (error) {
    console.error("[rally] Error closing group challenge:", error)
    return false
  }
  return true
}

export function getGroupChallengeUrl(code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://rallyplaylive.com"
  return `${origin}/group/${code}`
}

export function isGroupExpired(gc: GroupChallenge): boolean {
  return new Date() > new Date(gc.expires_at) || gc.status === "closed"
}

export function getGroupPool(gc: GroupChallenge): ChallengePool {
  return poolFromFlat(gc.question_ids)
}
