"use client"

import { useState, useEffect } from "react"
import { Target, ChevronRight } from "lucide-react"
import { loadStats, type RallyStats } from "@/lib/stats"
import Link from "next/link"

const CATEGORY_LABELS: Record<string, string> = {
  "Algebra": "Algebra",
  "Reading Comprehension": "Reading",
  "Grammar": "Grammar",
  "Data & Statistics": "Data & Stats",
}

const ALL_CATEGORIES = ["Algebra", "Reading Comprehension", "Grammar", "Data & Statistics"]

/**
 * Home screen card that recommends drilling the user's weakest category.
 * Only shows after 20+ total questions and if any category is below 70% accuracy.
 */
export function WeakSpotCard() {
  const [weakCategory, setWeakCategory] = useState<{ id: string; label: string; accuracy: number } | null>(null)

  useEffect(() => {
    const stats = loadStats()
    if (stats.totalQuestions < 20) return

    let worst: { id: string; accuracy: number } | null = null

    for (const cat of ALL_CATEGORIES) {
      const s = stats.byCategory[cat]
      if (!s || s.total < 5) continue // need at least 5 questions in category
      const acc = Math.round((s.correct / s.total) * 100)
      if (acc < 70 && (!worst || acc < worst.accuracy)) {
        worst = { id: cat, accuracy: acc }
      }
    }

    if (worst) {
      setWeakCategory({
        id: worst.id,
        label: CATEGORY_LABELS[worst.id] || worst.id,
        accuracy: worst.accuracy,
      })
    }
  }, [])

  if (!weakCategory) return null

  return (
    <Link
      href={`/play?category=${encodeURIComponent(weakCategory.id)}`}
      className="block bg-gradient-to-r from-[#EF4444]/10 to-[#F97316]/10 border border-[#EF4444]/20 rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EF4444]/15 flex items-center justify-center">
            <Target className="w-4.5 h-4.5 text-[#EF4444]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">drill {weakCategory.label.toLowerCase()}</p>
            <p className="text-xs text-[#85B7EB]/50">{weakCategory.accuracy}% accuracy — let&apos;s improve it</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#85B7EB]/40" />
      </div>
    </Link>
  )
}
