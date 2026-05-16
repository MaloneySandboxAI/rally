"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { Diamond, Trophy, Swords, ChevronRight, ChevronLeft, Users, Lock, Crown } from "lucide-react"
import Link from "next/link"
import { CATEGORY_SHORT, CATEGORY_COLORS } from "@/lib/categories"
import {
  getGroupChallenge,
  getGroupEntries,
  joinGroupChallenge,
  closeGroupChallenge,
  isGroupExpired,
  type GroupChallenge,
  type GroupEntry,
} from "@/lib/group-challenges"

function GroupPageContent() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [gc, setGc] = useState<GroupChallenge | null>(null)
  const [entries, setEntries] = useState<GroupEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState("anonymous")
  const [isGuest, setIsGuest] = useState(false)
  const [joining, setJoining] = useState(false)
  const [closing, setClosing] = useState(false)

  const loadData = useCallback(async () => {
    const challenge = await getGroupChallenge(code)
    if (!challenge) {
      setError("Group challenge not found — the link may be expired or invalid.")
      setLoading(false)
      return
    }
    setGc(challenge)

    const e = await getGroupEntries(challenge.id)
    setEntries(e)
    setLoading(false)
  }, [code])

  useEffect(() => {
    if (!code) return

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id)
        setCurrentUserName(
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "anonymous"
        )
      } else {
        const guest = typeof window !== "undefined" && localStorage.getItem("rally_is_guest") === "true"
        setIsGuest(guest)
        if (guest) {
          setCurrentUserName(localStorage.getItem("rally_guest_name") || "guest")
        }
      }
    })

    loadData()
  }, [code, loadData])

  // Poll for leaderboard updates every 30s
  useEffect(() => {
    if (!gc) return
    const interval = setInterval(async () => {
      const e = await getGroupEntries(gc.id)
      setEntries(e)
    }, 30000)
    return () => clearInterval(interval)
  }, [gc])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center">
        <Spinner className="w-8 h-8 text-[#378ADD]" />
        <p className="text-[#85B7EB] mt-4 font-medium">loading group challenge...</p>
      </div>
    )
  }

  if (error || !gc) {
    return (
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5 text-center relative">
        <Link href="/home" className="absolute top-6 left-5 text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> home
        </Link>
        <Users className="w-12 h-12 text-[#378ADD]/40 mb-3" />
        <h1 className="text-lg font-extrabold text-white mb-1">challenge not found</h1>
        <p className="text-[#85B7EB]/60 text-xs mb-5">{error}</p>
        <a href="/home" className="bg-[#378ADD] text-white rounded-xl py-3 px-6 font-bold text-sm">back to home</a>
      </div>
    )
  }

  const expired = isGroupExpired(gc)
  const isCreator = currentUserId === gc.creator_id
  const myEntry = entries.find(e => currentUserId ? e.player_id === currentUserId : e.player_name === currentUserName && !e.player_id)
  const hasJoined = !!myEntry
  const hasPlayed = myEntry && myEntry.score >= 0
  const isFull = entries.length >= gc.max_players
  const playerCount = entries.length
  const playedCount = entries.filter(e => e.score >= 0).length
  const catColor = CATEGORY_COLORS[gc.category] || "#378ADD"
  const catShort = CATEGORY_SHORT[gc.category] || gc.category

  const sortedEntries = [...entries]
    .filter(e => e.score >= 0)
    .sort((a, b) => b.gems_earned - a.gems_earned)

  const myRank = hasPlayed ? sortedEntries.findIndex(e => e.id === myEntry?.id) + 1 : null

  const handleJoin = async () => {
    if (!currentUserId && !isGuest) {
      window.location.href = `/login?returnTo=${encodeURIComponent(`/group/${code}`)}`
      return
    }
    setJoining(true)
    const success = await joinGroupChallenge({
      groupChallengeId: gc.id,
      playerId: currentUserId || undefined,
      playerName: currentUserName,
    })
    if (success) {
      await loadData()
    }
    setJoining(false)
  }

  const handlePlay = () => {
    router.push(`/play?group=${code}&category=${encodeURIComponent(gc.category)}`)
  }

  const handleClose = async () => {
    setClosing(true)
    await closeGroupChallenge(code)
    await loadData()
    setClosing(false)
  }

  return (
    <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/home" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1 mb-3">
          <ChevronLeft className="w-4 h-4" /> home
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: catColor + "20" }}>
            <Users className="w-5 h-5" style={{ color: catColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-white leading-tight">{gc.creator_name}&apos;s {catShort} challenge</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[#85B7EB]/50">{playerCount} player{playerCount !== 1 ? "s" : ""}</span>
              <span className="text-xs text-[#85B7EB]/30">·</span>
              <span className="text-xs text-[#85B7EB]/50">{playedCount} played</span>
              {expired && <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">ended</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Action area */}
      <div className="px-5 py-4 flex-shrink-0">
        {expired ? (
          <div className="bg-[#0a2d4a] rounded-xl p-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#85B7EB]/40" />
            <span className="text-sm text-[#85B7EB]/60">this challenge has ended</span>
          </div>
        ) : !hasJoined && !isFull ? (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-[#378ADD] text-white rounded-xl py-3.5 font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#378ADD]/30 active:scale-[0.98]"
          >
            {joining ? <Spinner className="w-5 h-5" /> : <Swords className="w-5 h-5" />}
            {joining ? "joining..." : "join challenge"}
          </button>
        ) : !hasJoined && isFull ? (
          <div className="bg-[#0a2d4a] rounded-xl p-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#85B7EB]/40" />
            <span className="text-sm text-[#85B7EB]/60">challenge is full ({gc.max_players} players)</span>
          </div>
        ) : hasJoined && !hasPlayed ? (
          <button
            onClick={handlePlay}
            className="w-full bg-gradient-to-r from-[#378ADD] to-[#5B9FE6] text-white rounded-xl py-3.5 font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#378ADD]/30 active:scale-[0.98]"
          >
            play now <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        ) : hasPlayed && myRank ? (
          <div className="bg-[#0a2d4a] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#EF9F27]" />
              <span className="text-sm font-bold text-white">#{myRank} of {sortedEntries.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Diamond className="w-3.5 h-3.5 text-[#EF9F27] fill-[#EF9F27]" />
              <span className="text-sm font-extrabold text-white">{myEntry?.gems_earned}</span>
            </div>
          </div>
        ) : null}

        {/* Creator close button */}
        {isCreator && !expired && (
          <button
            onClick={handleClose}
            disabled={closing}
            className="w-full mt-2 text-xs text-red-400/50 hover:text-red-400/70 font-medium py-2 transition-colors"
          >
            {closing ? "closing..." : "close challenge (no new players)"}
          </button>
        )}
      </div>

      {/* Leaderboard */}
      <div className="flex-1 px-5 pb-6 overflow-y-auto">
        <h2 className="text-sm font-extrabold text-[#85B7EB]/60 mb-2">leaderboard</h2>
        {sortedEntries.length === 0 ? (
          <div className="bg-[#0a2d4a] rounded-xl p-6 text-center">
            <Swords className="w-8 h-8 text-[#378ADD]/30 mx-auto mb-2" />
            <p className="text-sm text-[#85B7EB]/40">no scores yet — be the first!</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sortedEntries.map((entry, idx) => {
              const rank = idx + 1
              const isMe = currentUserId ? entry.player_id === currentUserId : entry.player_name === currentUserName && !entry.player_id
              return (
                <div
                  key={entry.id}
                  className={`rounded-xl px-3.5 py-2.5 flex items-center gap-3 ${
                    isMe ? "bg-[#378ADD]/15 border border-[#378ADD]/30" : "bg-[#0a2d4a]"
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    rank === 1 ? "bg-[#EF9F27]/20 text-[#EF9F27]" :
                    rank === 2 ? "bg-[#C0C0C0]/20 text-[#C0C0C0]" :
                    rank === 3 ? "bg-[#CD7F32]/20 text-[#CD7F32]" :
                    "bg-[#85B7EB]/10 text-[#85B7EB]/50"
                  }`}>
                    {rank <= 3 ? <Crown className="w-3.5 h-3.5" /> : rank}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold truncate block ${isMe ? "text-[#378ADD]" : "text-white"}`}>
                      {entry.player_name}{isMe ? " (you)" : ""}
                    </span>
                    <span className="text-[10px] text-[#85B7EB]/40">{entry.correct_count}/5 correct</span>
                  </div>

                  {/* Gems */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Diamond className="w-3.5 h-3.5 text-[#EF9F27] fill-[#EF9F27]" />
                    <span className="text-sm font-extrabold text-white">{entry.gems_earned}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Waiting players (joined but not played) */}
        {entries.filter(e => e.score < 0).length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold text-[#85B7EB]/30 uppercase tracking-wider mb-1.5">waiting to play</p>
            <div className="flex flex-wrap gap-1.5">
              {entries.filter(e => e.score < 0).map(e => (
                <span key={e.id} className="text-xs bg-[#0a2d4a] text-[#85B7EB]/50 px-2.5 py-1 rounded-full">
                  {e.player_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GroupChallengePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center">
        <Spinner className="w-8 h-8 text-[#378ADD]" />
        <p className="text-[#85B7EB] mt-4 font-medium">loading group challenge...</p>
      </div>
    }>
      <GroupPageContent />
    </Suspense>
  )
}
