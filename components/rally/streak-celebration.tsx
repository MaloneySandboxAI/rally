"use client"

import { useState, useEffect } from "react"
import { BookOpen } from "lucide-react"

/**
 * Full-screen streak celebration shown when a player extends their streak.
 * Uses a book/page-turning metaphor instead of fire.
 */
export function StreakCelebration({
  streak,
  onDismiss,
}: {
  streak: number
  onDismiss: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [flipping, setFlipping] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true))
    // Page flip animation
    setTimeout(() => setFlipping(true), 300)
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const isMilestone = streak % 7 === 0 || streak === 3 || streak === 5

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#021f3d]/90" />

      {/* Content */}
      <div className={`relative text-center transition-all duration-500 ${visible ? "scale-100 translate-y-0" : "scale-90 translate-y-4"}`}>
        {/* Book icon with page-flip animation */}
        <div className="relative mx-auto mb-5 w-20 h-20">
          <div className={`w-20 h-20 rounded-2xl bg-[#EF9F27]/20 flex items-center justify-center transition-transform duration-700 ${flipping ? "scale-110" : "scale-100"}`}>
            <BookOpen className={`w-10 h-10 text-[#EF9F27] transition-transform duration-500 ${flipping ? "rotate-[-8deg]" : ""}`} />
          </div>
          {/* Page flip effect */}
          {flipping && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-5 h-14 bg-[#EF9F27]/10 rounded-sm animate-[pageFlip_0.6s_ease-out]" />
            </div>
          )}
        </div>

        {/* Streak count */}
        <div className="text-5xl font-extrabold text-[#EF9F27] mb-1">
          {streak}
        </div>
        <div className="text-lg font-bold text-white mb-1">
          {streak === 1 ? "day one!" : "day streak!"}
        </div>
        <p className="text-sm text-[#85B7EB]/50 mb-2">
          {streak === 1
            ? "the journey of 1600 starts with a single question"
            : isMilestone
            ? "incredible dedication — keep turning pages!"
            : "another day, another chapter"}
        </p>

        {/* Streak dots visualization */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: Math.min(streak, 14) }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#EF9F27] animate-[popIn_0.3s_ease-out_both]"
              style={{ animationDelay: `${400 + i * 80}ms` }}
            />
          ))}
          {streak > 14 && (
            <span className="text-xs text-[#EF9F27]/60 ml-1">+{streak - 14}</span>
          )}
        </div>

        <p className="text-xs text-[#85B7EB]/30 mt-6">tap to continue</p>
      </div>

      <style jsx>{`
        @keyframes pageFlip {
          0% { transform: rotateY(0deg) translateX(0); opacity: 0.8; }
          50% { transform: rotateY(-90deg) translateX(-10px); opacity: 0.4; }
          100% { transform: rotateY(-180deg) translateX(-20px); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
