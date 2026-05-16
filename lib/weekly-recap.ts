"use client"

import { createClient } from "@/lib/supabase/client"
import type { Challenge } from "@/lib/challenges"

export interface WeeklyRecap {
  totalChallenges: number
  wins: number
  losses: number
  totalGemsEarned: number
  bestWin: { gems: number; category: string; opponentName: string } | null
  mostPlayedOpponent: { name: string; count: number } | null
  mostPlayedCategory: { name: string; count: number } | null
  winStreak: number
  weekStart: string
  weekEnd: string
}

export async function getWeeklyRecap(userId: string): Promise<WeeklyRecap | null> {
  if (typeof window === "undefined") return null

  const supabase = createClient()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from("challenges")
    .select("creator_id, creator_name, creator_score, challenger_id, challenger_name, challenger_score, category, completed_at")
    .eq("status", "completed")
    .or(`creator_id.eq.${userId},challenger_id.eq.${userId}`)
    .gte("completed_at", weekAgo.toISOString())
    .order("completed_at", { ascending: false })

  if (error || !data || data.length === 0) return null

  let wins = 0
  let losses = 0
  let totalGems = 0
  let bestWin: WeeklyRecap["bestWin"] = null
  const opponentCounts = new Map<string, { name: string; count: number }>()
  const categoryCounts = new Map<string, number>()

  // Track win streak from most recent game backwards
  let winStreak = 0
  let streakBroken = false

  for (const c of data) {
    const isCreator = c.creator_id === userId
    const myScore = isCreator ? (c.creator_score ?? 0) : (c.challenger_score ?? 0)
    const theirScore = isCreator ? (c.challenger_score ?? 0) : (c.creator_score ?? 0)
    const opponentName = isCreator ? (c.challenger_name || "friend") : c.creator_name
    const opponentId = isCreator ? c.challenger_id : c.creator_id

    const won = myScore > theirScore
    if (won) {
      wins++
    } else {
      losses++
    }

    if (!streakBroken) {
      if (won) winStreak++
      else streakBroken = true
    }

    totalGems += myScore

    if (won && (!bestWin || myScore > bestWin.gems)) {
      bestWin = { gems: myScore, category: c.category, opponentName }
    }

    if (opponentId) {
      const existing = opponentCounts.get(opponentId)
      if (existing) {
        existing.count++
      } else {
        opponentCounts.set(opponentId, { name: opponentName, count: 1 })
      }
    }

    categoryCounts.set(c.category, (categoryCounts.get(c.category) || 0) + 1)
  }

  let mostPlayedOpponent: WeeklyRecap["mostPlayedOpponent"] = null
  for (const entry of opponentCounts.values()) {
    if (!mostPlayedOpponent || entry.count > mostPlayedOpponent.count) {
      mostPlayedOpponent = entry
    }
  }

  let mostPlayedCategory: WeeklyRecap["mostPlayedCategory"] = null
  for (const [name, count] of categoryCounts) {
    if (!mostPlayedCategory || count > mostPlayedCategory.count) {
      mostPlayedCategory = { name, count }
    }
  }

  const weekStart = weekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const weekEnd = now.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return {
    totalChallenges: data.length,
    wins,
    losses,
    totalGemsEarned: totalGems,
    bestWin,
    mostPlayedOpponent,
    mostPlayedCategory,
    winStreak,
    weekStart,
    weekEnd,
  }
}

const DISMISS_KEY_PREFIX = "rally_recap_dismissed_"

export function getWeekKey(): string {
  const now = new Date()
  const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000)
  return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`
}

export function isRecapDismissed(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(DISMISS_KEY_PREFIX + getWeekKey()) === "true"
}

export function dismissRecap(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DISMISS_KEY_PREFIX + getWeekKey(), "true")
}
