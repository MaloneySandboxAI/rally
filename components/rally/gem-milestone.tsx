"use client"

import { useState, useEffect } from "react"
import { Diamond, Share2 } from "lucide-react"

const MILESTONES = [100, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]

/**
 * Check if a gem milestone was just crossed.
 * Returns the milestone number if crossed, null otherwise.
 */
export function checkGemMilestone(gemsBefore: number, gemsAfter: number): number | null {
  for (const milestone of MILESTONES) {
    if (gemsBefore < milestone && gemsAfter >= milestone) {
      return milestone
    }
  }
  // Check every 1000 above 10000
  if (gemsAfter >= 10000) {
    const prevThousand = Math.floor(gemsBefore / 1000) * 1000
    const currThousand = Math.floor(gemsAfter / 1000) * 1000
    if (currThousand > prevThousand && currThousand > 10000) {
      return currThousand
    }
  }
  return null
}

function getGemMilestoneMessage(milestone: number): string {
  if (milestone >= 10000) return `Legendary! ${milestone.toLocaleString()} gems earned!`
  if (milestone >= 5000) return `Incredible! ${milestone.toLocaleString()} gems!`
  if (milestone >= 1000) return `You've earned ${milestone.toLocaleString()} gems! You're on your way!`
  if (milestone >= 500) return `${milestone} gems earned! Keep going!`
  return `First milestone — ${milestone} gems!`
}

interface GemMilestoneProps {
  milestone: number
  onDismiss: () => void
}

export function GemMilestoneCelebration({ milestone, onDismiss }: GemMilestoneProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string; size: number }>>([])

  useEffect(() => {
    // Generate confetti particles
    const colors = ["#F59E0B", "#EF4444", "#22C55E", "#378ADD", "#A855F7", "#EC4899"]
    const p = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
    }))
    setParticles(p)

    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 animate-in fade-in duration-300">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-bounce"
              style={{
                left: `${p.x}%`,
                top: "-10px",
                width: p.size,
                height: p.size,
                borderRadius: p.size > 8 ? "50%" : "2px",
                backgroundColor: p.color,
                animation: `confetti-fall ${2 + Math.random()}s ease-in ${p.delay}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Celebration card */}
      <div className="bg-gradient-to-b from-[#0a2d4a] to-[#021f3d] rounded-3xl p-8 mx-6 max-w-sm w-full text-center border border-[#F59E0B]/30 shadow-2xl shadow-[#F59E0B]/20 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mx-auto mb-4">
          <Diamond className="w-10 h-10 text-[#F59E0B] fill-[#F59E0B]" />
        </div>

        <h2 className="text-4xl font-extrabold text-[#F59E0B] mb-2">
          {milestone.toLocaleString()}
        </h2>
        <p className="text-white font-bold text-lg mb-1">gems earned!</p>
        <p className="text-[#85B7EB]/60 text-sm mb-6">
          {getGemMilestoneMessage(milestone)}
        </p>

        <div className="space-y-2.5">
          {typeof navigator !== "undefined" && navigator.share && (
            <button
              onClick={() => {
                navigator.share({
                  title: "Rally SAT Prep",
                  text: `I just hit ${milestone.toLocaleString()} gems on Rally! Think you can beat me?`,
                  url: "https://rallyplaylive.com",
                }).catch(() => {})
              }}
              className="w-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" />
              brag to a friend
            </button>
          )}

          <button
            onClick={onDismiss}
            className="w-full bg-[#378ADD] text-white rounded-2xl py-3.5 font-bold text-base active:scale-[0.98]"
          >
            keep going!
          </button>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
