"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { getAdaptiveDifficulty } from "@/lib/stats"

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

const DIFFICULTY_BADGE: Record<string, { label: string; color: string }> = {
  easy: { label: "easy", color: "#22c55e" },
  medium: { label: "medium", color: "#f59e0b" },
  hard: { label: "hard", color: "#ef4444" },
}

export function CategoryCards({ variant = "grid", onCategorySelect }: CategoryCardsProps) {
  const [levels, setLevels] = useState<Record<string, string>>({})

  useEffect(() => {
    const loaded: Record<string, string> = {}
    for (const cat of CATEGORIES) {
      loaded[cat.id] = getAdaptiveDifficulty(cat.id) || "easy"
    }
    setLevels(loaded)
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
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.map((category) => (
        <Link
          key={category.id}
          href={`/play?category=${encodeURIComponent(category.id)}`}
          className="bg-white rounded-2xl p-5 flex flex-col items-start transition-all active:scale-[0.98] hover:shadow-lg"
          style={{
            borderLeft: `4px solid ${category.color}`,
          }}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[#0a1628] font-extrabold text-base">{category.name}</span>
            {levels[category.id] && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${DIFFICULTY_BADGE[levels[category.id]]?.color ?? "#22c55e"}20`,
                  color: DIFFICULTY_BADGE[levels[category.id]]?.color ?? "#22c55e",
                }}
              >
                {DIFFICULTY_BADGE[levels[category.id]]?.label ?? "easy"}
              </span>
            )}
          </div>
          <span
            className="text-sm font-bold mt-2 flex items-center gap-1"
            style={{ color: category.color }}
          >
            play <ChevronRight className="w-4 h-4" strokeWidth={3} />
          </span>
        </Link>
      ))}
    </div>
  )
}
