"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronRight } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// ─── Storage keys ─────────────────────────────────────────────────────────
const SAT_DATE_KEY       = "rally_sat_date"
const TARGET_SCORE_KEY   = "rally_target_score"
const ONBOARDING_KEY     = "rally_onboarding_complete"

// ─── Difficulty thresholds per target score range ─────────────────────────
function getThresholdsForTarget(target: number) {
  if (target >= 1500) return { medium: 40, hard: 60, games: 5 }
  if (target >= 1400) return { medium: 45, hard: 65, games: 5 }
  if (target >= 1200) return { medium: 50, hard: 70, games: 5 }
  if (target >= 1000) return { medium: 55, hard: 75, games: 5 }
  return { medium: 60, hard: 80, games: 5 }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const today  = new Date()
  today.setHours(0,0,0,0); target.setHours(0,0,0,0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function defaultDateStr(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split("T")[0]
}

export function SatCountdown() {
  const [satDate,        setSatDate]        = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate,   setSelectedDate]   = useState(defaultDateStr())
  const [targetScore,    setTargetScore]    = useState(1000)
  const [isHydrated,     setIsHydrated]     = useState(false)

  // ── On mount: check rally_onboarding_complete ───────────────────────────
  useEffect(() => {
    const onboardingDone = localStorage.getItem(ONBOARDING_KEY)
    const storedDate     = localStorage.getItem(SAT_DATE_KEY)
    const storedTarget   = localStorage.getItem(TARGET_SCORE_KEY)

    if (storedDate)  setSatDate(storedDate)
    if (storedTarget) setTargetScore(parseInt(storedTarget, 10) || 1000)

    // Show full-screen onboarding if not yet completed
    if (!onboardingDone) setShowOnboarding(true)

    setIsHydrated(true)
  }, [])

  // ── Save both date + score, mark onboarding complete ───────────────────
  function completeOnboarding() {
    if (selectedDate) {
      localStorage.setItem(SAT_DATE_KEY, selectedDate)
      setSatDate(selectedDate)
    }
    localStorage.setItem(TARGET_SCORE_KEY, targetScore.toString())
    // Store derived thresholds for adaptive difficulty system
    const thresholds = getThresholdsForTarget(targetScore)
    localStorage.setItem("rally_difficulty_thresholds", JSON.stringify(thresholds))
    localStorage.setItem(ONBOARDING_KEY, "true")
    setShowOnboarding(false)
  }

  function saveUpdatedDate() {
    if (!selectedDate) return
    localStorage.setItem(SAT_DATE_KEY, selectedDate)
    localStorage.setItem(TARGET_SCORE_KEY, targetScore.toString())
    const thresholds = getThresholdsForTarget(targetScore)
    localStorage.setItem("rally_difficulty_thresholds", JSON.stringify(thresholds))
    setSatDate(selectedDate)
    setShowDatePicker(false)
  }

  if (!isHydrated) return null

  const daysUntil = satDate ? getDaysUntil(satDate) : null

  return (
    <>
      {/* Countdown card */}
      {satDate && daysUntil !== null && daysUntil > 0 && (
        <div
          className="bg-[#0a2d4a] rounded-2xl px-5 py-4 flex items-center gap-3 border-l-4 border-[#378ADD] cursor-pointer transition-all hover:brightness-110"
          onClick={() => setShowDatePicker(true)}
        >
          <Calendar className="w-5 h-5 text-[#378ADD]" />
          <div className="flex flex-col flex-1">
            <span className="text-sm font-bold text-white">{daysUntil} days until your SAT</span>
            <span className="text-xs text-[#85B7EB]">{formatDate(satDate)}</span>
          </div>
        </div>
      )}

      {/* No date set */}
      {!satDate && (
        <button
          onClick={() => setShowDatePicker(true)}
          className="w-full bg-[#0a2d4a] rounded-2xl px-5 py-4 flex items-center gap-3 border-l-4 border-[#378ADD]/50 transition-all hover:brightness-110"
        >
          <Calendar className="w-5 h-5 text-[#378ADD]/70" />
          <span className="text-sm font-medium text-[#85B7EB] flex-1 text-left">add your SAT date</span>
          <ChevronRight className="w-4 h-4 text-[#85B7EB]" />
        </button>
      )}

      {/* ── ONBOARDING MODAL (full-screen, rally_onboarding_complete gate) ── */}
      <Dialog open={showOnboarding} onOpenChange={() => { /* prevent dismiss without completing */ }}>
        <DialogContent
          className="bg-[#021f3d] border-[#378ADD]/30 text-white max-w-sm"
          // Prevent closing by clicking outside
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-center text-white">
              welcome to rally
            </DialogTitle>
            <DialogDescription className="text-center text-[#85B7EB] text-sm">
              Tell us about your SAT so we can personalise your training.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-2">
            {/* (a) SAT date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#85B7EB]">when is your SAT?</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#0a2d4a] border border-[#378ADD]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#378ADD] [color-scheme:dark]"
              />
            </div>

            {/* (b) Target score */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#85B7EB]">{"what's your target score?"}</label>
                <span className="text-xl font-extrabold text-white">{targetScore}</span>
              </div>
              <input
                type="range"
                min={400} max={1600} step={50}
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
                className="w-full accent-[#378ADD]"
              />
              <div className="flex justify-between text-xs text-[#85B7EB]/50">
                <span>400</span><span>1000</span><span>1600</span>
              </div>
            </div>

            {/* (c) Let's go button */}
            <Button
              onClick={completeOnboarding}
              className="w-full bg-[#378ADD] hover:bg-[#378ADD]/90 text-white font-extrabold text-lg py-6 rounded-2xl"
            >
              {"let's go \u2192"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Date/score update dialog ── */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="bg-[#0a2d4a] border-[#378ADD]/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-center">update SAT details</DialogTitle>
            <DialogDescription className="text-center text-[#85B7EB] text-sm">
              Change your test date or target score.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-[#021f3d] border border-[#378ADD]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#378ADD] [color-scheme:dark]"
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#85B7EB]">target score</label>
                <span className="text-lg font-extrabold text-white">{targetScore}</span>
              </div>
              <input
                type="range" min={400} max={1600} step={50}
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
                className="w-full accent-[#378ADD]"
              />
              <div className="flex justify-between text-xs text-[#85B7EB]/50">
                <span>400</span><span>1000</span><span>1600</span>
              </div>
            </div>
            <Button onClick={saveUpdatedDate} disabled={!selectedDate}
              className="w-full bg-[#378ADD] hover:bg-[#378ADD]/90 text-white font-bold disabled:opacity-50">
              Save
            </Button>
            {satDate && (
              <Button variant="ghost" onClick={() => {
                localStorage.removeItem(SAT_DATE_KEY)
                setSatDate(null)
                setShowDatePicker(false)
              }} className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                Remove Date
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
