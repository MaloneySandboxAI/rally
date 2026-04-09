"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  getUserChallenges,
  formatTimeRemaining,
  isChallengeExpired,
  cancelChallenge,
  clearCompletedChallenges,
  type Challenge,
} from "@/lib/challenges"
import { EmptyGamesState } from "./empty-games-state"
import { Swords, Clock, Trophy, ChevronRight, Diamond, X, Trash2 } from "lucide-react"
import Link from "next/link"

const CATEGORY_COLORS: Record<string, string> = {
  "Algebra": "#378ADD",
  "Reading Comprehension": "#14B8A6",
  "Grammar": "#A855F7",
  "Data & Statistics": "#F97316",
}

const CATEGORY_SHORT: Record<string, string> = {
  "Algebra": "Algebra",
  "Reading Comprehension": "Reading",
  "Grammar": "Grammar",
  "Data & Statistics": "Data & Stats",
}

export function GamesList() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelingCode, setCancelingCode] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        getUserChallenges(session.user.id).then((data) => {
          setChallenges(data.filter(c => !isChallengeExpired(c)))
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
  }, [])

  const handleCancel = async (shareCode: string) => {
    if (!userId) return
    setCancelingCode(shareCode)
    const success = await cancelChallenge(shareCode, userId)
    if (success) {
      setChallenges(prev => prev.filter(c => c.share_code !== shareCode))
    }
    setCancelingCode(null)
  }

  const handleClearCompleted = async () => {
    if (!userId) return
    setClearing(true)
    await clearCompletedChallenges(userId)
    setChallenges(prev => prev.filter(c => c.status !== "completed"))
    setClearing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 rounded-full border-2 border-[#378ADD] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!userId || challenges.length === 0) {
    return <EmptyGamesState />
  }

  const completedCount = challenges.filter(c => c.status === "completed").length

  return (
    <div className="flex flex-col gap-2">
      {challenges.map((c) => {
        const isCreator = c.creator_id === userId
        const opponentName = isCreator ? (c.challenger_name || "waiting...") : c.creator_name
        const color = CATEGORY_COLORS[c.category] || "#378ADD"
        const catLabel = CATEGORY_SHORT[c.category] || c.category
        const timeLeftStr = formatTimeRemaining(c)

        // Determine state
        const creatorPlayed = c.creator_score >= 0
        const challengerPlayed = c.status === "completed"

        let status: "waiting" | "your_turn" | "completed"
        if (challengerPlayed) {
          status = "completed"
        } else if (isCreator && !creatorPlayed) {
          status = "your_turn"
        } else if (!isCreator && creatorPlayed) {
          status = "your_turn"
        } else {
          status = "waiting"
        }

        // Can cancel: creator of a pending challenge that hasn't been accepted
        const canCancel = isCreator && status === "waiting" && !c.challenger_id

        // Result for completed games
        let resultLabel = ""
        let resultColor = ""
        if (status === "completed") {
          const myScore = isCreator ? (c.creator_score || 0) : (c.challenger_score || 0)
          const theirScore = isCreator ? (c.challenger_score || 0) : (c.creator_score || 0)
          if (myScore > theirScore) { resultLabel = "you won!"; resultColor = "#22C55E" }
          else if (myScore < theirScore) { resultLabel = "you lost"; resultColor = "#EF4444" }
          else { resultLabel = "tied"; resultColor = "#F59E0B" }
        }

        return (
          <div key={c.id} className="relative">
            <Link
              href={`/challenge/${c.share_code}`}
              className="bg-[#0a2d4a] rounded-xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-all"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              {/* Icon */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                {status === "completed" ? (
                  <Trophy className="w-4 h-4" style={{ color }} />
                ) : (
                  <Swords className="w-4 h-4" style={{ color }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white truncate">vs {opponentName}</span>
                  {status === "your_turn" && (
                    <span className="text-[10px] font-bold bg-[#378ADD] text-white px-2 py-0.5 rounded-full">your turn</span>
                  )}
                  {status === "waiting" && (
                    <span className="text-[10px] font-bold bg-[#0a2d4a] border border-[#85B7EB]/20 text-[#85B7EB]/60 px-2 py-0.5 rounded-full">waiting</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#85B7EB]/50">{catLabel}</span>
                  {status === "completed" && (
                    <span className="text-xs font-bold" style={{ color: resultColor }}>{resultLabel}</span>
                  )}
                  {status !== "completed" && timeLeftStr && (
                    <span className="text-[10px] text-[#85B7EB]/40 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {timeLeftStr}
                    </span>
                  )}
                </div>
              </div>

              {/* Score or arrow */}
              {status === "completed" ? (
                <div className="flex items-center gap-1 shrink-0">
                  <Diamond className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="text-sm font-extrabold text-white">
                    {isCreator ? c.creator_score : c.challenger_score}
                  </span>
                </div>
              ) : (
                <ChevronRight className="w-4 h-4 text-[#85B7EB]/30 shrink-0" />
              )}
            </Link>

            {/* Cancel button for pending challenges */}
            {canCancel && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleCancel(c.share_code)
                }}
                disabled={cancelingCode === c.share_code}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/15 flex items-center justify-center hover:bg-red-500/25 transition-colors z-10"
                title="Cancel challenge"
              >
                {cancelingCode === c.share_code ? (
                  <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X className="w-3 h-3 text-red-400" />
                )}
              </button>
            )}
          </div>
        )
      })}

      {/* Clear completed games */}
      {completedCount > 0 && (
        <button
          onClick={handleClearCompleted}
          disabled={clearing}
          className="mt-1 flex items-center justify-center gap-1.5 text-xs text-[#85B7EB]/40 hover:text-[#85B7EB]/60 font-medium py-2 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          {clearing ? "clearing..." : `clear ${completedCount} completed game${completedCount > 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  )
}
