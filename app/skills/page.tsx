"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Lock, Sparkles, TrendingUp, Clock, Infinity as InfinityIcon, X } from "lucide-react"
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

/** Bottom sheet for choosing timed (5-question round) vs untimed (endless practice) */
function ModeSelectSheet({
  category,
  subtopicId,
  categoryColor,
  onClose,
}: {
  category: string
  subtopicId: string
  categoryColor: string
  onClose: () => void
}) {
  const router = useRouter()
  const base = `/play?category=${encodeURIComponent(category)}&subtopic=${encodeURIComponent(subtopicId)}`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-[#0a2d4a] rounded-t-3xl px-5 pt-5 pb-8 animate-in slide-in-from-bottom duration-300">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#021f3d] flex items-center justify-center"
        >
          <X className="w-4 h-4 text-[#85B7EB]/50" />
        </button>

        <h3 className="text-lg font-extrabold text-white mb-1">choose your mode</h3>
        <p className="text-xs text-[#85B7EB]/50 mb-4">how do you want to practice?</p>

        <div className="space-y-2.5">
          {/* Timed */}
          <button
            onClick={() => {
              haptics.medium()
              router.push(base)
            }}
            className="w-full bg-[#021f3d] rounded-xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform border border-transparent hover:border-[#85B7EB]/10 text-left"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: categoryColor + "20" }}
            >
              <Clock className="w-5 h-5" style={{ color: categoryColor }} />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white block">timed round</span>
              <span className="text-[11px] text-[#85B7EB]/50">5 questions · timer · earn gems</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#85B7EB]/30 shrink-0" />
          </button>

          {/* Untimed */}
          <button
            onClick={() => {
              haptics.medium()
              router.push(base + "&untimed=true")
            }}
            className="w-full bg-[#021f3d] rounded-xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform border border-transparent hover:border-[#85B7EB]/10 text-left"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#A855F720" }}
            >
              <InfinityIcon className="w-5 h-5 text-[#A855F7]" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white block">untimed practice</span>
              <span className="text-[11px] text-[#85B7EB]/50">no timer · go at your own pace · review explanations</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#85B7EB]/30 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  )
}

function SkillMapContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "Algebra"
  const categoryColor = CATEGORY_COLORS[category] || "#378ADD"
  const categoryShort = CATEGORY_SHORT[category] || category

  const [subtopics, setSubtopics] = useState<{ id: string; label: string; level: SubtopicLevel }[]>([])
  const [avgLevel, setAvgLevel] = useState(1)
  const [modeSelectSubtopic, setModeSelectSubtopic] = useState<string | null>(null)

  useEffect(() => {
    setSubtopics(getCategorySubtopicLevels(category))
    setAvgLevel(getCategoryAverageLevel(category))
  }, [category])

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
          const levelLabel = LEVEL_LABELS[levelNum] || "beginner"
          const levelColor = LEVEL_COLORS[levelNum] || "#85B7EB"
          const accuracy = sub.level.totalAnswered > 0
            ? Math.round((sub.level.totalCorrect / sub.level.totalAnswered) * 100)
            : null

          return (
            <button
              key={sub.id}
              onClick={() => setModeSelectSubtopic(sub.id)}
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
                    lv {levelNum} · {levelLabel}
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

      {/* Mode selection bottom sheet */}
      {modeSelectSubtopic && (
        <ModeSelectSheet
          category={category}
          subtopicId={modeSelectSubtopic}
          categoryColor={categoryColor}
          onClose={() => setModeSelectSubtopic(null)}
        />
      )}
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
