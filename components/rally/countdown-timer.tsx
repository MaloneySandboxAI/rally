"use client"

import { Diamond, Zap } from "lucide-react"

const TIMER_COLORS = {
  normal: "#378ADD",
  warning: "#F59E0B",
  danger: "#EF4444",
}

export function CountdownTimer({
  timeRemaining,
  totalTime,
}: {
  timeRemaining: number
  totalTime: number
}) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progress = timeRemaining / totalTime
  const strokeDashoffset = circumference * (1 - progress)

  let color = TIMER_COLORS.normal
  if (timeRemaining <= 10) {
    color = TIMER_COLORS.danger
  } else if (timeRemaining <= 30) {
    color = TIMER_COLORS.warning
  }

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 transform -rotate-90">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#0a2d4a" strokeWidth="3" />
        <circle
          cx="24" cy="24" r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{timeRemaining}</span>
    </div>
  )
}

export function SpeedBonusAnimation({ amount }: { amount: number }) {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 animate-in fade-in zoom-in duration-300">
      <div className="bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
        <Zap className="w-6 h-6 fill-white" />
        <span className="text-lg font-extrabold">+{amount} gems</span>
        <span className="text-sm font-bold opacity-80">speed bonus!</span>
      </div>
    </div>
  )
}

export function FloatingGemIndicator({ amount, isSpeedBonus }: { amount: number; isSpeedBonus: boolean }) {
  return (
    <div className="absolute -top-2 right-4 animate-gem-float pointer-events-none">
      <div className={`flex items-center gap-1 ${isSpeedBonus ? 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444]' : 'bg-[#F59E0B]'} text-white px-2 py-1 rounded-full shadow-lg`}>
        <Diamond className="w-3 h-3 fill-white" />
        <span className="text-xs font-bold">+{amount}</span>
        {isSpeedBonus && <Zap className="w-3 h-3 fill-white" />}
      </div>
    </div>
  )
}

export const TIMER_BY_DIFFICULTY: Record<string, Record<string, number>> = {
  math: { easy: 45, medium: 75, hard: 120 },
  reading: { easy: 35, medium: 55, hard: 90 },
}

export function getTimerForQuestion(difficulty: string, isMath: boolean): number {
  const timers = isMath ? TIMER_BY_DIFFICULTY.math : TIMER_BY_DIFFICULTY.reading
  return timers[difficulty] ?? 60
}

export function getSpeedThreshold(difficulty: string, isMath: boolean): number {
  return Math.floor(getTimerForQuestion(difficulty, isMath) / 2)
}
