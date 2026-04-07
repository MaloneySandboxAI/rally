"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getUserChallenges, getChallengeTimeRemaining, isChallengeExpired, type Challenge } from "@/lib/challenges"
import { EmptyGamesState } from "./empty-games-state"
import { Swords, Clock, Trophy, ChevronRight, Diamond } from "lucide-react"
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

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        getUserChallenges(session.user.id).then((data) => {
          // Filter out expired challenges
          setChallenges(data.filter(c => !isChallengeExpired(c)))
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
  }, [])

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

  return (
    <div className="flex flex-col gap-2">
      {challenges.map((c) => {
        const isCreator = c.creator_id === userId
        const opponentName = isCreator ? (c.challenger_name || "waiting...") : c.creator_name
        const color = CATEGORY_COLORS[c.category] || "#378ADD"
        const catLabel = CATEGORY_SHORT[c.category] || c.category
        const timeLeft = getChallengeTimeRemaining(c)

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

        // Determine result for completed games
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
          <Link
            key={c.id}
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
                {status !== "completed" && timeLeft && (
                  <span className="text-[10px] text-[#85B7EB]/40 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {timeLeft.hours}h {timeLeft.minutes}m left
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
        )
      })}
    </div>
  )
}
