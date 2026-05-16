"use client"

import { useState, useEffect } from "react"
import { getRecentOpponents, type RecentOpponent } from "@/lib/recent-opponents"
import { CATEGORY_SHORT, CATEGORY_COLORS } from "@/lib/categories"

interface RecentOpponentsProps {
  userId: string | null
  onSelect: (opponent: RecentOpponent) => void
  selectedId?: string | null
}

function getInitial(name: string): string {
  return (name[0] || "?").toUpperCase()
}

export function RecentOpponents({ userId, onSelect, selectedId }: RecentOpponentsProps) {
  const [opponents, setOpponents] = useState<RecentOpponent[]>([])

  useEffect(() => {
    if (!userId) return
    getRecentOpponents(userId).then(setOpponents)
  }, [userId])

  if (!userId || opponents.length === 0) return null

  return (
    <div className="mb-3">
      <p className="text-[10px] font-bold text-[#85B7EB]/40 uppercase tracking-wider mb-1.5">play again</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {opponents.map(opp => {
          const catColor = CATEGORY_COLORS[opp.lastCategory] || "#378ADD"
          const catShort = CATEGORY_SHORT[opp.lastCategory] || opp.lastCategory
          const firstName = opp.name.split(" ")[0]

          return (
            <button
              key={opp.id}
              onClick={() => onSelect(opp)}
              className={`flex-shrink-0 h-11 rounded-full pl-1 pr-3 flex items-center gap-2 active:scale-[0.96] transition-all ${
                selectedId === opp.id
                  ? "bg-[#378ADD]/20 border-2 border-[#378ADD] ring-1 ring-[#378ADD]/30"
                  : "bg-[#021f3d] border border-[#85B7EB]/10"
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-extrabold"
                style={{ backgroundColor: catColor }}
              >
                {getInitial(opp.name)}
              </div>
              <div className="text-left min-w-0">
                <span className="text-xs font-bold text-white block leading-tight truncate max-w-[80px]">{firstName}</span>
                <span className="text-[9px] leading-tight" style={{ color: catColor }}>{catShort}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
