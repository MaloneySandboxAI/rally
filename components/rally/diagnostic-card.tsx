"use client"

import { useState, useEffect } from "react"
import { Stethoscope, ChevronRight, Check, X, RotateCcw } from "lucide-react"
import {
  loadDiagnosticResult,
  scoreDiagnostic,
  CATEGORY_SHORT,
  CATEGORY_COLORS,
  SUBTOPIC_MAP,
  type SubtopicScore,
} from "@/lib/diagnostic"
import { LEVEL_LABELS, LEVEL_COLORS, getCategorySubtopicLevels, hasSubtopicLevels } from "@/lib/subtopic-levels"
import Link from "next/link"

export function DiagnosticCard() {
  const [result, setResult] = useState<ReturnType<typeof scoreDiagnostic> | null>(null)
  const [hasTaken, setHasTaken] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const saved = loadDiagnosticResult()
    if (saved) {
      setHasTaken(true)
      setResult(scoreDiagnostic(saved.answers))
    }
  }, [])

  // User hasn't taken the diagnostic yet — prompt them
  if (!hasTaken || !result) {
    return (
      <Link
        href="/diagnostic"
        className="block bg-gradient-to-r from-[#378ADD]/10 to-[#A855F7]/10 border border-[#378ADD]/20 rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#378ADD]/15 flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5 text-[#378ADD]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">find your weak spots</p>
              <p className="text-xs text-[#85B7EB]/50">{18} questions · no timer · no gems</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#85B7EB]/40" />
        </div>
      </Link>
    )
  }

  // User has taken it — show results inline, expandable
  const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0
  const weakCount = result.weakSubtopics.length

  return (
    <div className="bg-gradient-to-r from-[#378ADD]/10 to-[#A855F7]/10 border border-[#378ADD]/20 rounded-2xl overflow-hidden">
      {/* Header — tap to expand/collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3.5 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#378ADD]/15 flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5 text-[#378ADD]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">
                diagnostic: {pct}%
                {weakCount > 0 && <span className="text-[#EF4444] ml-1">· {weakCount} weak spot{weakCount > 1 ? "s" : ""}</span>}
                {weakCount === 0 && <span className="text-green-400 ml-1">· all clear</span>}
              </p>
              <p className="text-xs text-[#85B7EB]/50">
                {expanded ? "tap to collapse" : "tap to see results & practice"}
              </p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-[#85B7EB]/40 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </button>

      {/* Expanded results */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Category breakdown with level info */}
          {Object.entries(SUBTOPIC_MAP).map(([category, subtopics]) => {
            const catScores = result.subtopicScores.filter(s => s.category === category)
            if (catScores.length === 0) return null
            const catStats = result.byCategory[category]
            const catPct = catStats ? Math.round((catStats.correct / catStats.total) * 100) : 0

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
                    <span className="text-xs font-bold text-white">{CATEGORY_SHORT[category]}</span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: catPct >= 70 ? "#22c55e" : catPct >= 50 ? "#f59e0b" : "#ef4444" }}
                  >
                    {catPct}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {subtopics.map(sub => {
                    const score = catScores.find(s => s.subtopic === sub.id)
                    if (!score) return null
                    return (
                      <span
                        key={sub.id}
                        className="text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1"
                        style={{
                          backgroundColor: score.isCorrect ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                          color: score.isCorrect ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {score.isCorrect ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        {sub.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {weakCount > 0 && (
              <Link
                href={`/skills?category=${encodeURIComponent(result.weakSubtopics[0].category)}`}
                className="flex-1 bg-[#378ADD] text-white rounded-xl py-2.5 text-xs font-bold active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                practice weak spots
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              href="/diagnostic"
              className="flex-1 bg-white/5 text-[#85B7EB]/70 rounded-xl py-2.5 text-xs font-bold active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              retake
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
