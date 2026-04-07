"use client"

import { useEffect, useState } from "react"
import { Trophy, Diamond, Crown, Medal, ChevronRight, Swords } from "lucide-react"
import { getLeaderboard } from "@/lib/challenges"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface LeaderboardEntry {
  userId: string
  username: string
  totalGems: number
  wins: number
  played: number
}

export default function RanksPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setCurrentUserId(session.user.id)
    })
    getLeaderboard().then((data) => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  const myRank = currentUserId ? entries.findIndex(e => e.userId === currentUserId) : -1

  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← home
        </Link>
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-[#EF9F27]" />
          <h1 className="text-2xl font-extrabold text-white">leaderboard</h1>
        </div>
        <p className="text-xs text-[#85B7EB]/50 mt-1">top challengers by gems earned in head-to-head</p>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#378ADD] border-t-transparent animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0a2d4a] flex items-center justify-center">
              <Swords className="w-8 h-8 text-[#378ADD]" />
            </div>
            <h2 className="text-lg font-extrabold text-white">no challenge data yet</h2>
            <p className="text-[#85B7EB]/60 text-sm max-w-xs">
              challenge a friend to start climbing the leaderboard — gems earned in head-to-head count here
            </p>
            <Link
              href="/"
              className="mt-2 bg-[#378ADD] text-white rounded-xl py-3 px-8 font-bold text-sm"
            >
              start a challenge
            </Link>
          </div>
        ) : (
          <>
            {/* Your rank banner */}
            {myRank >= 0 && (
              <div className="bg-gradient-to-r from-[#378ADD]/15 to-[#EF9F27]/15 border border-[#378ADD]/30 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#85B7EB]/60">your rank</p>
                  <p className="text-xl font-extrabold text-white">#{myRank + 1}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Diamond className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-xl font-extrabold text-[#EF9F27]">{entries[myRank].totalGems}</span>
                  </div>
                  <p className="text-xs text-[#85B7EB]/50">{entries[myRank].wins}W / {entries[myRank].played}P</p>
                </div>
              </div>
            )}

            {/* Top 3 podium */}
            {entries.length >= 3 && (
              <div className="flex items-end justify-center gap-3 mb-6">
                {/* 2nd place */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#C0C0C0]/15 flex items-center justify-center mb-1.5">
                    <Medal className="w-6 h-6 text-[#C0C0C0]" />
                  </div>
                  <p className="text-xs font-bold text-white truncate max-w-[80px]">{entries[1].username}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Diamond className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-xs font-bold text-[#C0C0C0]">{entries[1].totalGems}</span>
                  </div>
                </div>

                {/* 1st place */}
                <div className="flex flex-col items-center -mt-4">
                  <Crown className="w-6 h-6 text-[#EF9F27] mb-1" />
                  <div className="w-16 h-16 rounded-full bg-[#EF9F27]/15 flex items-center justify-center mb-1.5 ring-2 ring-[#EF9F27]/30">
                    <Trophy className="w-7 h-7 text-[#EF9F27]" />
                  </div>
                  <p className="text-sm font-extrabold text-white truncate max-w-[80px]">{entries[0].username}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Diamond className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-sm font-extrabold text-[#EF9F27]">{entries[0].totalGems}</span>
                  </div>
                </div>

                {/* 3rd place */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#CD7F32]/15 flex items-center justify-center mb-1.5">
                    <Medal className="w-6 h-6 text-[#CD7F32]" />
                  </div>
                  <p className="text-xs font-bold text-white truncate max-w-[80px]">{entries[2].username}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Diamond className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-xs font-bold text-[#CD7F32]">{entries[2].totalGems}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Full list */}
            <div className="space-y-1.5">
              {entries.map((entry, i) => {
                const isMe = entry.userId === currentUserId
                const winRate = entry.played > 0 ? Math.round((entry.wins / entry.played) * 100) : 0
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${
                      isMe ? "bg-[#378ADD]/10 border border-[#378ADD]/30" : "bg-[#0a2d4a]"
                    }`}
                  >
                    <span className={`text-sm font-extrabold w-7 text-center ${
                      i === 0 ? "text-[#EF9F27]" : i === 1 ? "text-[#C0C0C0]" : i === 2 ? "text-[#CD7F32]" : "text-[#85B7EB]/40"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-bold truncate block ${isMe ? "text-[#378ADD]" : "text-white"}`}>
                        {entry.username}{isMe ? " (you)" : ""}
                      </span>
                      <span className="text-[10px] text-[#85B7EB]/40">
                        {entry.wins}W–{entry.played - entry.wins}L · {winRate}% win rate
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Diamond className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-sm font-extrabold text-white">{entry.totalGems}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
