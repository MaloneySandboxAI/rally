"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  getUserChallenges,
  formatTimeRemaining,
  isChallengeExpired,
  isChallengeStale,
  cancelChallenge,
  clearCompletedChallenges,
  deleteExpiredChallenges,
  type Challenge,
} from "@/lib/challenges"
import { EmptyGamesState } from "./empty-games-state"
import { Swords, Clock, Trophy, ChevronRight, Diamond, X, Trash2 } from "lucide-react"
import Link from "next/link"
import { CATEGORY_COLORS, CATEGORY_SHORT } from "@/lib/categories"
import { getH2HRecord } from "@/lib/head-to-head"

export function GamesSummary() {
  const [counts, setCounts] = useState<{ yourTurn: number; waiting: number; results: number } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      const uid = session.user.id
      getUserChallenges(uid).then((data) => {
        const active = data.filter(c => !isChallengeExpired(c) || (c.status === "pending" && c.creator_id === uid))
        let yourTurn = 0
        let waiting = 0
        let results = 0
        for (const c of active) {
          const isCreator = c.creator_id === uid
          const creatorPlayed = c.creator_score >= 0
          if (isChallengeStale(c)) continue
          if (c.status === "completed") { results++; continue }
          if ((isCreator && !creatorPlayed) || (!isCreator && creatorPlayed)) yourTurn++
          else waiting++
        }
        if (yourTurn + waiting + results > 0) setCounts({ yourTurn, waiting, results })
      })
    })
  }, [])

  if (!counts) return null

  return (
    <Link
      href="/games"
      className="bg-[#0a2d4a] rounded-xl px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      <Swords className="w-5 h-5 text-[#378ADD] shrink-0" />
      <div className="flex-1 flex items-center gap-3">
        {counts.yourTurn > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#378ADD] text-white text-[10px] font-extrabold flex items-center justify-center">{counts.yourTurn}</span>
            <span className="text-xs font-bold text-white">your turn</span>
          </div>
        )}
        {counts.waiting > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#EF9F27]/20 text-[#EF9F27] text-[10px] font-extrabold flex items-center justify-center">{counts.waiting}</span>
            <span className="text-xs font-bold text-[#85B7EB]/60">waiting</span>
          </div>
        )}
        {counts.results > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-extrabold flex items-center justify-center">{counts.results}</span>
            <span className="text-xs font-bold text-[#85B7EB]/60">results</span>
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-[#85B7EB]/30 shrink-0" />
    </Link>
  )
}

export function GamesList() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelingCode, setCancelingCode] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [clearingExpired, setClearingExpired] = useState(false)
  const [h2hRecords, setH2hRecords] = useState<Record<string, { myWins: number; theirWins: number }>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const uid = session.user.id
        setUserId(uid)
        getUserChallenges(uid).then((data) => {
          const filtered = data.filter(c => {
            if (!isChallengeExpired(c)) return true
            return c.status === "pending" && c.creator_id === uid
          })
          setChallenges(filtered)
          setLoading(false)

          // Fetch h2h records for completed challenges
          const seen = new Set<string>()
          for (const c of filtered) {
            if (c.status !== "completed") continue
            const opponentId = c.creator_id === uid ? c.challenger_id : c.creator_id
            if (!opponentId || seen.has(opponentId + c.category)) continue
            seen.add(opponentId + c.category)
            getH2HRecord(uid, opponentId, c.category).then(r => {
              if (r) {
                setH2hRecords(prev => ({ ...prev, [opponentId + c.category]: { myWins: r.myWins, theirWins: r.theirWins } }))
              }
            })
          }
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

  const handleClearExpired = async () => {
    if (!userId) return
    setClearingExpired(true)
    await deleteExpiredChallenges(userId)
    setChallenges(prev => prev.filter(c => !isChallengeStale(c) || c.creator_id !== userId))
    setClearingExpired(false)
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
  const expiredCount = challenges.filter(c => isChallengeStale(c) && c.creator_id === userId).length

  return (
    <div className="flex flex-col gap-2">
      {challenges.map((c) => {
        const isCreator = c.creator_id === userId
        const hasOpponent = isCreator ? !!c.challenger_name : true
        const opponentName = isCreator ? (c.challenger_name || "") : c.creator_name
        const color = CATEGORY_COLORS[c.category] || "#378ADD"
        const catLabel = CATEGORY_SHORT[c.category] || c.category
        const timeLeftStr = formatTimeRemaining(c)
        const stale = isChallengeStale(c) && isCreator

        // Determine state
        const creatorPlayed = c.creator_score >= 0
        const challengerPlayed = c.status === "completed"

        let status: "waiting" | "your_turn" | "completed" | "expired"
        if (stale) {
          status = "expired"
        } else if (challengerPlayed) {
          status = "completed"
        } else if (isCreator && !creatorPlayed) {
          status = "your_turn"
        } else if (!isCreator && creatorPlayed) {
          status = "your_turn"
        } else {
          status = "waiting"
        }

        // Can cancel/delete: creator of a pending challenge that hasn't been accepted, or expired
        const canCancel = isCreator && (status === "waiting" || status === "expired") && !c.challenger_id

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
              className={`bg-[#0a2d4a] rounded-xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-all ${status === "expired" ? "opacity-50" : ""}`}
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
                  <span className="text-sm font-bold text-white truncate">
                    {hasOpponent ? `vs ${opponentName}` : catLabel}
                  </span>
                  {status === "your_turn" && (
                    <span className="text-[10px] font-bold bg-[#378ADD] text-white px-2 py-0.5 rounded-full">play now</span>
                  )}
                  {status === "waiting" && (
                    <span className="text-[10px] font-bold bg-[#EF9F27]/15 border border-[#EF9F27]/30 text-[#EF9F27] px-2 py-0.5 rounded-full">link sent</span>
                  )}
                  {status === "expired" && (
                    <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">expired</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {status === "waiting" && !hasOpponent ? (
                    <span className="text-[10px] text-[#85B7EB]/40">waiting for friend to open link</span>
                  ) : (
                    <span className="text-xs text-[#85B7EB]/50">{hasOpponent ? catLabel : ""}</span>
                  )}
                  {status === "completed" && (
                    <span className="text-xs font-bold" style={{ color: resultColor }}>{resultLabel}</span>
                  )}
                  {status === "completed" && (() => {
                    const opId = isCreator ? c.challenger_id : c.creator_id
                    const rec = opId ? h2hRecords[opId + c.category] : null
                    if (!rec || (rec.myWins === 0 && rec.theirWins === 0)) return null
                    return <span className="text-[10px] font-bold text-[#85B7EB]/40">{rec.myWins}-{rec.theirWins}</span>
                  })()}
                  {status === "expired" && (
                    <span className="text-[10px] text-red-400/60 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      no response
                    </span>
                  )}
                  {status !== "completed" && status !== "expired" && timeLeftStr && (
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

      {/* Clear expired challenges */}
      {expiredCount > 0 && (
        <button
          onClick={handleClearExpired}
          disabled={clearingExpired}
          className="mt-1 flex items-center justify-center gap-1.5 text-xs text-red-400/50 hover:text-red-400/70 font-medium py-2 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          {clearingExpired ? "deleting..." : `delete ${expiredCount} expired challenge${expiredCount > 1 ? "s" : ""}`}
        </button>
      )}

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
