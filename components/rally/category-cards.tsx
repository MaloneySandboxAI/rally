"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"

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
          href={`/play?category=${category.id}`}
          className="bg-white rounded-2xl p-5 flex flex-col items-start transition-all active:scale-[0.98] hover:shadow-lg"
          style={{
            borderLeft: `4px solid ${category.color}`,
          }}
        >
          <span className="text-[#0a1628] font-extrabold text-base">{category.name}</span>
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
