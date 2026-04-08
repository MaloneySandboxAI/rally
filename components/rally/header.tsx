"use client"

import { useState, useEffect } from "react"
import { Diamond, Crown, Heart, User, LogIn } from "lucide-react"
import { useGems } from "@/lib/gem-context"
import { usePremium } from "@/lib/premium-context"
import { getHearts } from "@/lib/hearts"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export function Header() {
  const { totalGems } = useGems()
  const { isPremium, dailyGemsRemaining, dailyGemCap, dailyGemsCapped } = usePremium()
  const [hearts, setHearts] = useState(5)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setHearts(getHearts())
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold text-secondary tracking-tight">
          rally
        </h1>
        {isLoggedIn ? (
          <Link
            href="/account"
            className="w-7 h-7 rounded-full bg-[#378ADD]/20 flex items-center justify-center hover:bg-[#378ADD]/30 transition-colors"
            title="Account"
          >
            <User className="w-3.5 h-3.5 text-[#378ADD]" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-[#378ADD] text-sm font-semibold hover:text-[#378ADD]/80 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            sign in
          </Link>
        )}
      </div>

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

        {!isPremium && (
          <Link href="/store" className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1.5">
            <Heart className="w-3.5 h-3.5 text-[#EF4444] fill-[#EF4444]" />
            <span className="text-sm font-bold text-[#EF4444]">{hearts}</span>
          </Link>
        )}

        <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
          <Diamond className="w-4 h-4 text-accent fill-accent" />
          <span className="text-sm font-bold text-accent">{totalGems.toLocaleString()}</span>
        </div>
      </div>
    </header>
  )
}
