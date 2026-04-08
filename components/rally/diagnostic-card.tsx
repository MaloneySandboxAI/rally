"use client"

import { useState, useEffect } from "react"
import { Stethoscope, ChevronRight, Check } from "lucide-react"
import { loadDiagnosticResult, scoreDiagnostic, CATEGORY_SHORT, CATEGORY_COLORS } from "@/lib/diagnostic"
import Link from "next/link"

export function DiagnosticCard() {
  const [result, setResult] = useState<ReturnType<typeof scoreDiagnostic> | null>(null)
  const [hasTaken, setHasTaken] = useState(false)

  useEffect(() => {
    const saved = loadDiagnosticResult()
    if (saved) {
      setHasTaken(true)
      setResult(scoreDiagnostic(saved.answers))
    }
  }, [])

  if (hasTaken && result) {
    const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0
    const weakCount = result.weakSubtopics.length

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
              <p className="text-sm font-bold text-white">
                diagnostic: {pct}%
                {weakCount > 0 && <span className="text-[#EF4444] ml-1">· {weakCount} weak spot{weakCount > 1 ? "s" : ""}</span>}
                {weakCount === 0 && <span className="text-green-400 ml-1">· all clear</span>}
              </p>
              <p className="text-xs text-[#85B7EB]/50">
                {weakCount > 0 ? "retake or drill weak areas" : "retake to check progress"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#85B7EB]/40" />
        </div>
      </Link>
    )
  }

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
