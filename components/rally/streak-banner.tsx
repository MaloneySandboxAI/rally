"use client"

import { useState, useEffect } from "react"

export function StreakBanner() {
  const [streak, setStreak] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Only read localStorage inside useEffect to avoid hydration mismatch
    const lastPlayed = localStorage.getItem("rally_last_played")
    const storedStreak = parseInt(localStorage.getItem("rally_streak") || "0", 10)
    
    if (!lastPlayed) {
      setStreak(0)
    } else {
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]
      
      if (lastPlayed === today || lastPlayed === yesterdayStr) {
        // Played today or yesterday, streak is valid
        setStreak(storedStreak)
      } else {
        // More than 1 day since last play, streak is broken
        localStorage.setItem("rally_streak", "0")
        setStreak(0)
      }
    }
    
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
