"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Store, Diamond, Heart, Flame, ShieldCheck, ChevronLeft, BarChart3 } from "lucide-react"
import { useGems, buyStreakFreeze, hasStreakFreeze, buyStatsDeepDive, hasStatsDeepDive, GEM_ECONOMY } from "@/lib/gem-context"
import { getHearts, refillHearts, HEARTS_CONFIG } from "@/lib/hearts"
import { toast } from "sonner"

export default function StorePage() {
  const router = useRouter()
  const { totalGems, addGems } = useGems()
  const [hearts, setHearts] = useState(HEARTS_CONFIG.maxHearts)
  const [hasFreezeActive, setHasFreezeActive] = useState(false)
  const [hasDeepDive, setHasDeepDive] = useState(false)

  useEffect(() => {
    setHearts(getHearts())
    setHasFreezeActive(hasStreakFreeze())
    setHasDeepDive(hasStatsDeepDive())
  }, [])

  const handleRefillHearts = () => {
    if (hearts >= HEARTS_CONFIG.maxHearts) {
      toast("hearts already full!", { duration: 2000 })
      return
    }
    const success = refillHearts(totalGems, addGems)
    if (success) {
      setHearts(HEARTS_CONFIG.maxHearts)
      toast.success("hearts refilled to 5!", { duration: 2000 })
    } else {
      toast.error(`not enough gems (need ${HEARTS_CONFIG.refillCost})`, { duration: 2000 })
    }
  }

  const handleBuyDeepDive = () => {
    if (hasDeepDive) {
      toast("stats deep dive already unlocked!", { duration: 2000 })
      return
    }
    const success = buyStatsDeepDive(totalGems, addGems)
    if (success) {
      setHasDeepDive(true)
      toast.success("stats deep dive unlocked! check your progress page", { duration: 3000 })
    } else {
      toast.error(`not enough gems (need ${GEM_ECONOMY.statsDeepDiveCost})`, { duration: 2000 })
    }
  }

  const handleBuyFreeze = () => {
    if (hasFreezeActive) {
      toast("you already have a streak freeze active!", { duration: 2000 })
      return
    }
    const success = buyStreakFreeze(totalGems, addGems)
    if (success) {
      setHasFreezeActive(true)
      toast.success("streak freeze activated!", { duration: 2000 })
    } else {
      toast.error(`not enough gems (need ${GEM_ECONOMY.streakFreezeCost})`, { duration: 2000 })
    }
  }

  return (
    <div className="min-h-screen bg-[#021f3d] pb-24">
      <header className="sticky top-0 z-10 bg-[#021f3d] px-5 pt-6 pb-4 border-b border-[#0a2d4a]">
        <Link href="/home" className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors inline-flex items-center gap-1 mb-3">
          <ChevronLeft className="w-4 h-4" />
          home
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-[#378ADD]" />
            <h1 className="text-2xl font-extrabold text-white">store</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0a2d4a] rounded-full px-3 py-1.5">
            <Diamond className="w-4 h-4 text-[#EF9F27] fill-[#EF9F27]" />
            <span className="text-white font-bold text-sm">{totalGems.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-4">
        {/* How it works */}
        <div className="bg-[#0a2d4a] rounded-2xl p-4 mb-2">
          <h2 className="text-white font-bold text-sm mb-2">how gems & hearts work</h2>
          <div className="space-y-2 text-[#85B7EB]/70 text-xs leading-relaxed">
            <p><span className="text-[#EF9F27] font-bold">gems</span> are earned by answering questions correctly. harder questions = more gems. speed bonuses for fast answers.</p>
            <p><span className="text-red-400 font-bold">hearts</span> are spent when you get an answer wrong in solo play. run out of hearts and you can't play until tomorrow (or refill with gems).</p>
            <p>free players earn up to <span className="text-white font-semibold">180+ gems/day</span> (more with speed bonuses) and get <span className="text-white font-semibold">5 hearts</span> + <span className="text-white font-semibold">3 rounds</span> per day.</p>
          </div>
        </div>

        {/* Heart Refill */}
        <button
          onClick={handleRefillHearts}
          className="w-full bg-[#0a2d4a] rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
            <Heart className="w-7 h-7 text-red-400 fill-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base">refill hearts</p>
            <p className="text-[#85B7EB]/50 text-xs mt-0.5">
              {hearts >= HEARTS_CONFIG.maxHearts
                ? "hearts already full"
                : `restore to ${HEARTS_CONFIG.maxHearts} hearts so you can keep playing`}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-[#EF9F27]/15 rounded-full px-3 py-1.5 shrink-0">
            <Diamond className="w-3.5 h-3.5 text-[#EF9F27] fill-[#EF9F27]" />
            <span className="text-[#EF9F27] font-bold text-sm">{HEARTS_CONFIG.refillCost}</span>
          </div>
        </button>

        {/* Streak Freeze */}
        <button
          onClick={handleBuyFreeze}
          className="w-full bg-[#0a2d4a] rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-[#378ADD]/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-[#378ADD]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base">streak freeze</p>
            <p className="text-[#85B7EB]/50 text-xs mt-0.5">
              {hasFreezeActive
                ? "freeze active — your streak is protected for 1 missed day"
                : "protect your streak if you miss a day of playing"}
            </p>
          </div>
          {hasFreezeActive ? (
            <div className="bg-[#14B8A6]/15 rounded-full px-3 py-1.5 shrink-0">
              <span className="text-[#14B8A6] font-bold text-xs">active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#EF9F27]/15 rounded-full px-3 py-1.5 shrink-0">
              <Diamond className="w-3.5 h-3.5 text-[#EF9F27] fill-[#EF9F27]" />
              <span className="text-[#EF9F27] font-bold text-sm">{GEM_ECONOMY.streakFreezeCost}</span>
            </div>
          )}
        </button>

        {/* Stats Deep Dive */}
        <button
          onClick={handleBuyDeepDive}
          className="w-full bg-[#0a2d4a] rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
            <BarChart3 className="w-7 h-7 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base">stats deep dive</p>
            <p className="text-[#85B7EB]/50 text-xs mt-0.5">
              {hasDeepDive
                ? "unlocked — view detailed breakdowns on your progress page"
                : "unlock per-difficulty breakdowns, trend analysis & weak spot insights"}
            </p>
          </div>
          {hasDeepDive ? (
            <div className="bg-purple-500/15 rounded-full px-3 py-1.5 shrink-0">
              <span className="text-purple-400 font-bold text-xs">owned</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#EF9F27]/15 rounded-full px-3 py-1.5 shrink-0">
              <Diamond className="w-3.5 h-3.5 text-[#EF9F27] fill-[#EF9F27]" />
              <span className="text-[#EF9F27] font-bold text-sm">{GEM_ECONOMY.statsDeepDiveCost}</span>
            </div>
          )}
        </button>

        {/* Streak milestones info */}
        <div className="bg-[#0a2d4a] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-[#F97316]" />
            <h2 className="text-white font-bold text-sm">streak bonuses</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#85B7EB]/70 text-xs">7-day streak</span>
              <div className="flex items-center gap-1">
                <Diamond className="w-3 h-3 text-[#EF9F27] fill-[#EF9F27]" />
                <span className="text-[#EF9F27] font-bold text-xs">+100</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#85B7EB]/70 text-xs">30-day streak</span>
              <div className="flex items-center gap-1">
                <Diamond className="w-3 h-3 text-[#EF9F27] fill-[#EF9F27]" />
                <span className="text-[#EF9F27] font-bold text-xs">+500</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#85B7EB]/70 text-xs">daily login</span>
              <div className="flex items-center gap-1">
                <Diamond className="w-3 h-3 text-[#EF9F27] fill-[#EF9F27]" />
                <span className="text-[#EF9F27] font-bold text-xs">+{GEM_ECONOMY.dailyLoginBonus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="pt-4 flex flex-col items-center gap-3">
          <Link
            href="/account"
            className="text-[#85B7EB]/50 text-sm font-medium hover:text-[#85B7EB] transition-colors"
          >
            account settings
          </Link>
        </div>
      </main>
    </div>
  )
}
