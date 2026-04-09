"use client"

import { useState, useEffect } from "react"
import { Flame } from "lucide-react"
import { claimDailyLogin, checkStreakMilestone } from "@/lib/gem-context"
import { useGems } from "@/lib/gem-context"

function getValidStreak(): number {
  if (typeof window === "undefined") return 0
  const lastPlayed = localStorage.getItem("rally_last_played")
  const storedStreak = parseInt(localStorage.getItem("rally_streak") || "0", 10)
  if (!lastPlayed) return 0
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]
  if (lastPlayed === today || lastPlayed === yesterdayStr) return storedStreak
  localStorage.setItem("rally_streak", "0")
  return 0
}

export function StreakBanner() {
  const { addGems } = useGems()
  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === "undefined") return 0
    return getValidStreak()
  })
  const [isHydrated, setIsHydrated] = useState(false)
  const [bonusMessage, setBonusMessage] = useState<string | null>(null)

  useEffect(() => {
    const currentStreak = getValidStreak()
    setStreak(currentStreak)
    setIsHydrated(true)

    // Daily login bonus
    const dailyGems = claimDailyLogin()
    if (dailyGems > 0) {
      addGems(dailyGems)
      setBonusMessage(`+${dailyGems} daily gems`)
    }

    // Streak milestone bonus
    const milestoneGems = checkStreakMilestone(currentStreak)
    if (milestoneGems > 0) {
      const milestoneKey = `rally_milestone_${currentStreak}`
      if (!localStorage.getItem(milestoneKey)) {
        addGems(milestoneGems)
        localStorage.setItem(milestoneKey, "true")
        setBonusMessage(`+${milestoneGems} streak bonus!`)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isHydrated) {
    return (
      <div className="bg-[#0a2d4a] rounded-2xl px-4 py-3 flex items-center gap-2.5">
        <Flame className="w-5 h-5 text-[#EF9F27]" />
        <div>
          <span className="text-sm font-extrabold text-[#EF9F27]">--</span>
          <span className="text-[10px] text-[#85B7EB]/50 ml-1">day streak</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="bg-[#0a2d4a] rounded-2xl px-4 py-3 flex items-center gap-2.5 border-l-3 border-[#EF9F27]">
        <Flame className="w-5 h-5 text-[#EF9F27] shrink-0" />
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-[#EF9F27]">{streak}</span>
            <span className="text-xs text-[#85B7EB]/60 font-semibold">day streak</span>
          </div>
          <p className="text-[10px] text-[#85B7EB]/40 truncate">
            {streak === 0 ? "play today to start" : "keep it going!"}
          </p>
        </div>
      </div>
      {bonusMessage && (
        <div className="bg-[#EF9F27]/10 border border-[#EF9F27]/30 rounded-lg px-3 py-1.5 text-center animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-xs font-bold text-[#EF9F27]">{bonusMessage}</span>
        </div>
      )}
    </div>
  )
}
