"use client"

import { createClient } from "@/lib/supabase/client"

export interface RecentOpponent {
  id: string
  name: string
  lastCategory: string
  lastPlayed: string
}

export async function getRecentOpponents(userId: string): Promise<RecentOpponent[]> {
  if (typeof window === "undefined") return []

  const supabase = createClient()

  const { data, error } = await supabase
    .from("challenges")
    .select("creator_id, creator_name, challenger_id, challenger_name, category, created_at, status")
    .or(`creator_id.eq.${userId},challenger_id.eq.${userId}`)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error || !data) return []

  const seen = new Map<string, RecentOpponent>()

  for (const c of data) {
    const isCreator = c.creator_id === userId
    const opponentId = isCreator ? c.challenger_id : c.creator_id
    const opponentName = isCreator ? (c.challenger_name || "friend") : c.creator_name

    if (!opponentId || seen.has(opponentId)) continue

    seen.set(opponentId, {
      id: opponentId,
      name: opponentName,
      lastCategory: c.category,
      lastPlayed: c.created_at,
    })

    if (seen.size >= 10) break
  }

  return Array.from(seen.values())
}
