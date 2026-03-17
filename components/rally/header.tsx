"use client"

import { Diamond } from "lucide-react"
import { useGems } from "@/lib/gem-context"

export function Header() {
  const { totalGems } = useGems()

  return (
    <header className="sticky top-0 z-50 bg-background px-4 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-extrabold text-secondary tracking-tight">
        rally
      </h1>
      
      <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
        <Diamond className="w-4 h-4 text-accent fill-accent" />
        <span className="text-sm font-bold text-accent">{totalGems.toLocaleString()}</span>
      </div>
    </header>
  )
}
