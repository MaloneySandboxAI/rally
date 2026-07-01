"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Lock, Sparkles, TrendingUp, Clock, Infinity as InfinityIcon } from "lucide-react"
import { SUBTOPIC_MAP, CATEGORY_COLORS, CATEGORY_SHORT } from "@/lib/diagnostic"
import {
  getCategorySubtopicLevels,
  getCategoryAverageLevel,
  LEVEL_LABELS,
  LEVEL_COLORS,
  MAX_LEVEL,
  type SubtopicLevel,
} from "@/lib/subtopic-levels"
import { haptics } from "@/lib/haptics"
import { BottomNav } from "@/components/rally/bottom-nav"

const MODE_KEY = "rally_practice_mode"

function SkillMapContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "Algebra"
  const categoryColor = CATEGORY_COLORS[category] || "#378ADD"
  const categoryShort = CATEGORY_SHORT[category] || category

  const router = useRouter()
  const [subtopics, setSubtopics] = useState<{ id: string; label: string; level: SubtopicLevel }[]>([])
  const [avgLevel, setAvgLevel] = useState(1)
  const [mode, setMode] = useState<"timed" | "untimed">(() => {
    if (typeof window === "undefined") return "timed"
    return (localStorage.getItem(MODE_KEY) as "timed" | "untimed") || "timed"
  })

  useEffect(() => {
    setSubtopics(getCategorySubtopicLevels(category))
    setAvgLevel(getCategoryAverageLevel(category))
  }, [category])

  const handleModeChange = (m: "timed" | "untimed") => {
    setMode(m)
    if (typeof window !== "undefined") localStorage.setItem(MODE_KEY, m)
  }

  const handleSubtopicTap = (subtopicId: string) => {
    haptics.medium()
    const base = `/play?category=${encodeURIComponent(category)}&subtopic=${encodeURIComponent(subtopicId)}`
    router.push(mode === "untimed" ? base + "&untimed=true" : base)
  }

  // Progress bar for each subtopic
  function LevelBar({ level }: { level: number }) {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: MAX_LEVEL }, (_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all"
            style={{
              backgroundColor: i < level ? LEVEL_COLORS[level] : "rgba(133,183,235,0.15)",
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/home"
            className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            home
          </Link>
        </div>

        {/* Category title + average level */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: categoryColor + "20" }}
          >
            <TrendingUp className="w-5 h-5" style={{ color: categoryColor }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">{categoryShort}</h1>
            <p className="text-xs text-[#85B7EB]/50">
              avg level {avgLevel.toFixed(1)} · {subtopics.length} skills
            </p>
          </div>
        </div>
      </header>

      {/* Mode toggle — persists across sessions */}
      <div className="mx-4 mb-3">
        <div className="flex bg-[#0a2d4a] rounded-lg p-0.5">
          <button
            onClick={() => handleModeChange("timed")}
            className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === "timed" ? "bg-[#378ADD] text-white" : "text-[#85B7EB]/50"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> timed · earn gems
          </button>
          <button
            onClick={() => handleModeChange("untimed")}
            className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === "untimed" ? "bg-[#A855F7] text-white" : "text-[#85B7EB]/50"
            }`}
          >
            <InfinityIcon className="w-3.5 h-3.5" /> untimed · review
          </button>
        </div>
      </div>

      {/* Category-specific diagnostic */}
      <div className="mx-4 mb-3">
        <Link
          href={`/diagnostic?category=${encodeURIComponent(category)}`}
          className="flex items-center justify-between rounded-xl px-4 py-3 active:scale-[0.98] transition-transform"
          style={{ backgroundColor: categoryColor + "12", borderWidth: 1, borderColor: categoryColor + "30" }}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4" style={{ color: categoryColor }} />
            <div>
              <span className="text-sm font-bold text-white block">
                take {categoryShort.toLowerCase()} diagnostic
              </span>
              <span className="text-[10px] text-[#85B7EB]/40">
                {(SUBTOPIC_MAP[category] || []).length} questions · sets your starting levels
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: categoryColor }} />
        </Link>
      </div>

      {/* Subtopic list */}
      <div className="flex-1 px-4 pb-24 space-y-2">
        {subtopics.map(sub => {
          const levelNum = sub.level.level
          const levelLabel = LEVEL_LABELS[levelNum] || "Level 1"
          const levelColor = LEVEL_COLORS[levelNum] || "#85B7EB"
          const accuracy = sub.level.totalAnswered > 0
            ? Math.round((sub.level.totalCorrect / sub.level.totalAnswered) * 100)
            : null

          return (
            <button
              key={sub.id}
              onClick={() => handleSubtopicTap(sub.id)}
              className="block w-full text-left bg-[#0a2d4a] rounded-xl px-4 py-3.5 active:scale-[0.98] transition-transform border border-transparent hover:border-[#85B7EB]/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{sub.label}</span>
                <div className="flex items-center gap-2">
                  {accuracy !== null && (
                    <span className="text-[10px] text-[#85B7EB]/40">{accuracy}% acc</span>
                  )}
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: levelColor + "20",
                      color: levelColor,
                    }}
                  >
                    {levelLabel}
                  </span>
                </div>
              </div>
              <LevelBar level={levelNum} />
              {sub.level.totalAnswered > 0 && (
                <p className="text-[10px] text-[#85B7EB]/30 mt-1.5">
                  {sub.level.totalCorrect}/{sub.level.totalAnswered} lifetime · level {levelNum < MAX_LEVEL ? `up at ${4}/5 correct` : "maxed!"}
                </p>
              )}
            </button>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}

export default function SkillMapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#021f3d] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#378ADD] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SkillMapContent />
    </Suspense>
  )
}
