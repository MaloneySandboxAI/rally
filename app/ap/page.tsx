"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CATEGORY_COLORS, CATEGORY_SHORT, SUBTOPIC_MAP } from "@/lib/diagnostic"
import {
  getCategoryAverageLevel,
  hasSubtopicLevels,
  MAX_LEVEL,
  LEVEL_LABELS,
} from "@/lib/subtopic-levels"
import { loadStats } from "@/lib/stats"
import { BottomNav } from "@/components/rally/bottom-nav"
import { ChallengeButton } from "@/components/rally/challenge-button"

const AP_CATEGORIES = ["AP Biology", "AP Pre Calculus", "AP US History", "AP English Language"]

export default function APTestsPage() {
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [accuracy, setAccuracy] = useState<Record<string, number | null>>({})
  const [hasLevels, setHasLevels] = useState(false)

  useEffect(() => {
    const lvls: Record<string, number> = {}
    const acc: Record<string, number | null> = {}
    const stats = loadStats()

    for (const cat of AP_CATEGORIES) {
      lvls[cat] = getCategoryAverageLevel(cat)
      const catStats = stats.byCategory[cat]
      acc[cat] = catStats && catStats.total >= 5
        ? Math.round((catStats.correct / catStats.total) * 100)
        : null
    }
    setLevels(lvls)
    setAccuracy(acc)
    setHasLevels(hasSubtopicLevels())
  }, [])

  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors block mb-3">
          ← home
        </Link>
        <h1 className="text-2xl font-extrabold text-white">AP Tests</h1>
        <p className="text-sm text-[#85B7EB]/60 mt-1">practice for AP exams</p>
      </header>

      <main className="px-5 py-6 space-y-6 max-w-lg mx-auto">
        {/* Category rings grid */}
        <div className="grid grid-cols-2 gap-3">
          {AP_CATEGORIES.map(cat => {
            const color = CATEGORY_COLORS[cat] || "#22C55E"
            const short = CATEGORY_SHORT[cat] || cat
            const avg = levels[cat] || 1
            const pct = accuracy[cat]
            const progress = avg / MAX_LEVEL
            const subtopicCount = (SUBTOPIC_MAP[cat] || []).length
            const levelLabel = LEVEL_LABELS[Math.round(avg)] || "beginner"

            return (
              <Link
                key={cat}
                href={`/skills?category=${encodeURIComponent(cat)}`}
                className="bg-[#0a2d4a] rounded-2xl p-4 flex flex-col items-center active:scale-[0.97] transition-transform"
              >
                {/* Ring */}
                <div className="relative w-16 h-16 mb-2">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke={color + "20"} strokeWidth="5" />
                    <circle
                      cx="32" cy="32" r="26"
                      fill="none"
                      stroke={color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 163.36} ${163.36}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-extrabold text-white">
                      {hasLevels ? avg.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>

                <span className="text-sm font-bold text-white text-center">{short}</span>
                {hasLevels ? (
                  <span className="text-[10px] text-center mt-0.5" style={{ color }}>
                    {levelLabel}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#85B7EB]/40 text-center mt-0.5">
                    {subtopicCount} skills
                  </span>
                )}
                {pct !== null && (
                  <span
                    className="text-[9px] font-bold mt-0.5"
                    style={{ color: pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444" }}
                  >
                    {pct}% acc
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Challenge button for AP categories */}
        <div>
          <ChallengeButton />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
