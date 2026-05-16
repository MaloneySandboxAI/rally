"use client"

import { createClient } from "@/lib/supabase/client"

export interface H2HRecord {
  myWins: number
  theirWins: number
  category: string
}

export async function recordH2HResult(winnerId: string, loserId: string, category: string): Promise<void> {
  const supabase = createClient()
  await supabase.rpc("upsert_h2h_record", {
    p_winner_id: winnerId,
    p_loser_id: loserId,
    p_category: category,
  })
}

export async function getH2HRecord(
  currentUserId: string,
  opponentId: string,
  category: string
): Promise<H2HRecord | null> {
  if (typeof window === "undefined") return null
  const supabase = createClient()

  const p1 = currentUserId < opponentId ? currentUserId : opponentId
  const p2 = currentUserId < opponentId ? opponentId : currentUserId
  const currentIsP1 = currentUserId === p1

  const { data, error } = await supabase
    .from("head_to_head")
    .select("player1_wins, player2_wins")
    .eq("player1_id", p1)
    .eq("player2_id", p2)
    .eq("category", category)
    .single()

  if (error || !data) return null

  return {
    myWins: currentIsP1 ? data.player1_wins : data.player2_wins,
    theirWins: currentIsP1 ? data.player2_wins : data.player1_wins,
    category,
  }
}

export async function getAllH2HRecords(
  currentUserId: string,
  opponentId: string
): Promise<H2HRecord[]> {
  if (typeof window === "undefined") return []
  const supabase = createClient()

  const p1 = currentUserId < opponentId ? currentUserId : opponentId
  const p2 = currentUserId < opponentId ? opponentId : currentUserId
  const currentIsP1 = currentUserId === p1

  const { data, error } = await supabase
    .from("head_to_head")
    .select("player1_wins, player2_wins, category")
    .eq("player1_id", p1)
    .eq("player2_id", p2)

  if (error || !data) return []

  return data.map(r => ({
    myWins: currentIsP1 ? r.player1_wins : r.player2_wins,
    theirWins: currentIsP1 ? r.player2_wins : r.player1_wins,
    category: r.category,
  }))
}

export function formatH2HRecord(record: H2HRecord, opponentName: string): string {
  if (record.myWins === 0 && record.theirWins === 0) return "first matchup!"
  if (record.myWins > record.theirWins) return `you lead ${opponentName} ${record.myWins}-${record.theirWins}`
  if (record.theirWins > record.myWins) return `${opponentName} leads ${record.theirWins}-${record.myWins}`
  return `tied ${record.myWins}-${record.theirWins}`
}

export function getH2HSummary(
  records: H2HRecord[]
): { totalMyWins: number; totalTheirWins: number } {
  let totalMyWins = 0
  let totalTheirWins = 0
  for (const r of records) {
    totalMyWins += r.myWins
    totalTheirWins += r.theirWins
  }
  return { totalMyWins, totalTheirWins }
}
