"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { getCategoryAverageLevel, LEVEL_COLORS, hasSubtopicLevels } from "@/lib/subtopic-levels"

export const CATEGORIES = [
  {
    id: "Algebra",
    name: "Algebra",
    color: "#378ADD", // electric blue
  },
  {
    id: "Reading Comprehension",
    name: "Reading",
    color: "#14B8A6", // teal
  },
  {
    id: "Grammar",
    name: "Grammar",
    color: "#A855F7", // purple
  },
  {
    id: "Data & Statistics",
    name: "Data & Stats",
    color: "#F97316", // coral/orange
  },
]

interface CategoryCardsProps {
  variant?: "grid" | "compact"
  onCategorySelect?: (categoryId: string) => void
}

export function CategoryCards({ variant = "grid", onCategorySelect }: CategoryCardsProps) {
  const [avgLevels, setAvgLevels] = useState<Record<string, number>>({})
  const [hasLevels, setHasLevels] = useState(false)

  useEffect(() => {
    const loaded: Record<string, number> = {}
    for (const cat of CATEGORIES) {
      loaded[cat.id] = getCategoryAverageLevel(cat.id)
    }
    setAvgLevels(loaded)
    setHasLevels(hasSubtopicLevels())
  }, [])

  if (variant === "compact") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect?.(category.id)}
            className="bg-white rounded-2xl p-4 flex flex-col items-start transition-all active:scale-[0.98] hover:shadow-lg"
            style={{
              borderLeft: `4px solid ${category.color}`,
            }}
          >
            <span className="text-[#0a1628] font-bold text-sm">{category.name}</span>
            <span
              className="text-xs font-semibold mt-1 flex items-center gap-0.5"
              style={{ color: category.color }}
            >
              play <ChevronRight className="w-3 h-3" strokeWidth={3} />
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {CATEGORIES.map((category) => {
        const avg = avgLevels[category.id] || 1
        const levelColor = LEVEL_COLORS[Math.round(avg)] || "#85B7EB"

        return (
          <Link
            key={category.id}
            href={`/skills?category=${encodeURIComponent(category.id)}`}
            className="bg-white rounded-xl py-3 px-3.5 flex items-center justify-between transition-all active:scale-[0.98] hover:shadow-lg"
            style={{
              borderLeft: `3px solid ${category.color}`,
            }}
          >
            <div>
              <span className="text-[#0a1628] font-extrabold text-sm block">{category.name}</span>
              {hasLevels && (
                <span
                  className="text-[9px] font-bold"
                  style={{ color: levelColor }}
                >
                  avg lv {avg.toFixed(1)}
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={3} style={{ color: category.color }} />
          </Link>
        )
      })}
    </div>
  )
}
