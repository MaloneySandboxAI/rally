"use client"

import { useState } from "react"
import { Plus, Sparkles } from "lucide-react"
import { ChallengeWaitlistSheet } from "./challenge-waitlist-sheet"

export function ChallengeButton() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsSheetOpen(true)}
        className="relative w-full bg-primary text-primary-foreground rounded-2xl py-4 px-6 flex flex-col items-center justify-center gap-1 font-extrabold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] hover:brightness-110"
        aria-label="Challenge a friend"
      >
        {/* Coming Soon Badge */}
        <div className="absolute -top-2 -right-2 bg-[#F59E0B] text-[#0a1628] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          coming soon
        </div>

        <div className="flex items-center gap-2 text-lg">
          <Plus className="w-5 h-5" strokeWidth={3} />
          challenge a friend
        </div>
        
        {/* 4x gems label */}
        <span className="text-xs font-semibold text-white/70">
          4x gems · 100 per correct answer
        </span>
      </button>

      <ChallengeWaitlistSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        variant="challenge"
      />
    </>
  )
}
