"use client"

import { useState, useEffect } from "react"
import { Diamond, Crown, Heart, LogOut } from "lucide-react"
import { useGems } from "@/lib/gem-context"
import { usePremium } from "@/lib/premium-context"
import { getHearts } from "@/lib/hearts"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function Header() {
  const { totalGems } = useGems()
  const { isPremium, dailyGemsRemaining, dailyGemCap, dailyGemsCapped } = usePremium()
  const [hearts, setHearts] = useState(5)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setHearts(getHearts())
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem("rally_is_pro")
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 bg-background px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-extrabold text-secondary tracking-tight">
          rally
        </h1>
        {isLoggedIn && (
          <button
            onClick={handleSignOut}
            className="text-[#85B7EB]/30 hover:text-[#85B7EB]/60 transition-colors p-1"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
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
