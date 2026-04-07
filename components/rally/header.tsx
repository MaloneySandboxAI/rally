"use client"

import { Diamond, Crown } from "lucide-react"
import { useGems } from "@/lib/gem-context"
import { usePremium } from "@/lib/premium-context"
import Link from "next/link"

export function Header() {
  const { totalGems } = useGems()
  const { isPremium, dailyGemsRemaining, dailyGemCap, dailyGemsCapped } = usePremium()

  return (
    <header className="sticky top-0 z-50 bg-background px-4 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-extrabold text-secondary tracking-tight">
        rally
      </h1>

      <div className="flex items-center gap-3">
        {/* Daily gem cap indicator for free users */}
        {!isPremium && (
          <Link href="/upgrade" className="flex items-center gap-1 text-[10px] text-[#85B7EB]/40 hover:text-[#85B7EB]/60 transition-colors">
            {dailyGemsCapped ? (
              <span className="text-[#F97316] font-semibold">cap reached</span>
            ) : (
              <span>{dailyGemsRemaining}/{dailyGemCap} today</span>
            )}
          </Link>
        )}

        {isPremium && (
          <Crown className="w-3.5 h-3.5 text-[#F97316]" />
        )}

        <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
          <Diamond className="w-4 h-4 text-accent fill-accent" />
          <span className="text-sm font-bold text-accent">{totalGems.toLocaleString()}</span>
        </div>
      </div>
    </header>
  )
}
