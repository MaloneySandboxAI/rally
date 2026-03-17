"use client"

interface StreakBannerProps {
  days: number
}

export function StreakBanner({ days }: StreakBannerProps) {
  return (
    <div className="bg-[#0a2d4a] rounded-2xl px-5 py-4 flex items-center gap-3 border-l-4 border-[#EF9F27] shadow-[inset_0_0_20px_rgba(239,159,39,0.15)]">
      <span className="text-[24px]" role="img" aria-label="fire">🔥</span>
      <div className="flex flex-col">
        <span className="text-base font-extrabold text-[#EF9F27]">
          {days} day streak
        </span>
        <span className="text-xs text-[#85B7EB]">
          keep it going · play today
        </span>
      </div>
    </div>
  )
}
