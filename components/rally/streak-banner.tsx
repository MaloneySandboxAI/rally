"use client"

import { useState, useEffect } from "react"

function getValidStreak(): number {
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
  // Lazy initializer reads localStorage only on first render
  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === "undefined") return 0
    return getValidStreak()
  })
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Re-sync after hydration in case SSR returned 0
    setStreak(getValidStreak())
    setIsHydrated(true)
  }, [])

  // Show a motivational message based on streak status
  const getMessage = () => {
    if (streak === 0) {
      return "start your streak · play today"
    }
    return "keep it going · play today"
  }

  if (!isHydrated) {
    return (
      <div className="bg-[#0a2d4a] rounded-2xl px-5 py-4 flex items-center gap-3 border-l-4 border-[#EF9F27] shadow-[inset_0_0_20px_rgba(239,159,39,0.15)]">
        <span className="text-[24px]" role="img" aria-label="fire">🔥</span>
        <div className="flex flex-col">
          <span className="text-base font-extrabold text-[#EF9F27]">
            -- day streak
          </span>
          <span className="text-xs text-[#85B7EB]">
            loading...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0a2d4a] rounded-2xl px-5 py-4 flex items-center gap-3 border-l-4 border-[#EF9F27] shadow-[inset_0_0_20px_rgba(239,159,39,0.15)]">
      <span className="text-[24px]" role="img" aria-label="fire">🔥</span>
      <div className="flex flex-col">
        <span className="text-base font-extrabold text-[#EF9F27]">
          {streak} day streak
        </span>
        <span className="text-xs text-[#85B7EB]">
          {getMessage()}
        </span>
      </div>
    </div>
  )
}
