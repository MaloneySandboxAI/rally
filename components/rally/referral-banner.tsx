"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { ChallengeWaitlistSheet } from "./challenge-waitlist-sheet"

export function ReferralBanner() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsSheetOpen(true)}
        className="w-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-[#F59E0B]/20"
      >
        <Sparkles className="w-4 h-4 text-[#F59E0B]" />
        <span className="text-sm font-semibold text-white">
          refer a friend · earn 500 bonus gems when they join
        </span>
      </button>

      <ChallengeWaitlistSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        variant="referral"
      />
    </>
  )
}
