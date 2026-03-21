"use client"

import { useState, useEffect } from "react"
import { Sparkles, Crown, Check } from "lucide-react"

const PRO_KEY = "rally_is_pro"

const PRO_BENEFITS = [
  "unlimited solo rounds",
  "unlimited hearts",
  "2x gem earning",
  "detailed analytics",
]

export function ProBanner() {
  const [isPro, setIsPro] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsPro(localStorage.getItem(PRO_KEY) === "true")
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null

  // Pro users see a subtle badge instead of the upgrade card
  if (isPro) {
    return (
      <div className="bg-gradient-to-r from-[#378ADD]/20 to-[#A855F7]/20 border border-[#A855F7]/30 rounded-2xl px-5 py-3 flex items-center gap-3">
        <Crown className="w-5 h-5 text-[#A855F7]" />
        <span className="text-sm font-bold text-[#A855F7]">Rally Pro</span>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#0a2d4a] to-[#1a1a3e] border border-[#A855F7]/30 rounded-2xl px-5 py-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-[#A855F7]" />
        <h3 className="text-lg font-extrabold text-white">go Pro</h3>
      </div>

      <ul className="space-y-2 mb-4">
        {PRO_BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2 text-sm text-[#85B7EB]">
            <Check className="w-3.5 h-3.5 text-[#A855F7] flex-shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-extrabold text-white">$7.99</span>
        <span className="text-sm text-[#85B7EB]">/month</span>
        <span className="text-xs text-[#85B7EB]/60 ml-2">or $59.99/year</span>
      </div>

      <button
        disabled
        className="w-full bg-[#A855F7]/30 text-[#A855F7] rounded-xl py-3 font-bold text-sm cursor-not-allowed"
      >
        coming soon
      </button>
    </div>
  )
}
