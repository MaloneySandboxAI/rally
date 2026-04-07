"use client"

import { useEffect, useState } from "react"
import { Check, Crown, Swords, Diamond, ChevronRight } from "lucide-react"
import Link from "next/link"


export default function UpgradeSuccessPage() {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Fire confetti (dynamic import for client-side only)
    import("canvas-confetti").then((mod) => {
      const confetti = mod.default
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#378ADD", "#A855F7", "#14B8A6", "#F97316"],
      })
    }).catch(() => {
      // confetti not available — fine
    })

    // Animate in
    setTimeout(() => setShowContent(true), 100)

    // Update local premium flag
    localStorage.setItem("rally_is_pro", "true")
  }, [])

  return (
    <div className="min-h-[100dvh] bg-[#021f3d] flex flex-col items-center justify-center px-5">
      <div className={`text-center transition-all duration-500 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#378ADD] flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2">
          you&apos;re premium!
        </h1>
        <p className="text-[#85B7EB]/60 text-sm mb-8 max-w-xs mx-auto">
          your 7-day free trial has started. unlimited gems and challenges are unlocked.
        </p>

        {/* Quick actions */}
        <div className="space-y-3 w-full max-w-xs mx-auto mb-8">
          <Link
            href="/"
            className="flex items-center justify-between bg-[#0a2d4a] rounded-xl px-4 py-3.5 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <Diamond className="w-5 h-5 text-[#14B8A6]" />
              <span className="text-white font-semibold text-sm">start practicing</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#85B7EB]/30" />
          </Link>

          <Link
            href="/?challenge=true"
            className="flex items-center justify-between bg-[#0a2d4a] rounded-xl px-4 py-3.5 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <Swords className="w-5 h-5 text-[#A855F7]" />
              <span className="text-white font-semibold text-sm">challenge a friend</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#85B7EB]/30" />
          </Link>
        </div>
      </div>
    </div>
  )
}
