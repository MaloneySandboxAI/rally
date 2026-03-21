"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "rally_sat_date"
const ONBOARDING_COMPLETE_KEY = "rally_onboarding_complete"

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })
}

function getDaysUntil(dateStr: string): number {
  const targetDate = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function SatCountdown() {
  const [satDate, setSatDate] = useState<string | null>(null)
  const [showSetupPrompt, setShowSetupPrompt] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY)

    if (stored) {
      setSatDate(stored)
    }
    // Show the setup prompt every time until the user completes onboarding
    if (!onboardingComplete) {
      const defaultDate = new Date()
      defaultDate.setMonth(defaultDate.getMonth() + 3)
      setSelectedDate(defaultDate.toISOString().split("T")[0])
      setShowSetupPrompt(true)
    }
    setIsHydrated(true)
  }, [])

  const handleSaveDate = () => {
    if (selectedDate) {
      localStorage.setItem(STORAGE_KEY, selectedDate)
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true")
      setSatDate(selectedDate)
      setShowDatePicker(false)
      setShowSetupPrompt(false)
    }
  }

  const handleOpenDatePicker = () => {
    setShowSetupPrompt(false)
    setShowDatePicker(true)
    const defaultDate = new Date()
    defaultDate.setMonth(defaultDate.getMonth() + 3)
    setSelectedDate(defaultDate.toISOString().split("T")[0])
  }

  if (!isHydrated) return null

  const daysUntil = satDate ? getDaysUntil(satDate) : null

  return (
    <>
      {/* Countdown Card - shows when date is set */}
      {satDate && daysUntil !== null && daysUntil > 0 && (
        <div
          className="bg-[#0a2d4a] rounded-2xl px-5 py-4 flex items-center gap-3 border-l-4 border-[#378ADD] cursor-pointer transition-all hover:brightness-110"
          onClick={() => setShowDatePicker(true)}
        >
          <Calendar className="w-5 h-5 text-[#378ADD]" />
          <div className="flex flex-col flex-1">
            <span className="text-sm font-bold text-white">
              {daysUntil} days until your SAT
            </span>
            <span className="text-xs text-[#85B7EB]">
              {formatDate(satDate)}
            </span>
          </div>
        </div>
      )}

      {/* No date set - show prompt link */}
      {!satDate && (
        <button
          onClick={handleOpenDatePicker}
          className="w-full bg-[#0a2d4a] rounded-2xl px-5 py-4 flex items-center gap-3 border-l-4 border-[#378ADD]/50 transition-all hover:brightness-110"
        >
          <Calendar className="w-5 h-5 text-[#378ADD]/70" />
          <span className="text-sm font-medium text-[#85B7EB] flex-1 text-left">
            add your SAT date
          </span>
          <ChevronRight className="w-4 h-4 text-[#85B7EB]" />
        </button>
      )}

      {/* First Launch Setup Prompt — date only */}
      <Dialog open={showSetupPrompt} onOpenChange={setShowSetupPrompt}>
        <DialogContent className="bg-[#0a2d4a] border-[#378ADD]/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-center">
              When is your SAT?
            </DialogTitle>
            <DialogDescription className="text-center text-[#85B7EB] text-sm">
              Set your test date so we can build a study plan for you.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-[#85B7EB]">test date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#021f3d] border border-[#378ADD]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#378ADD] [color-scheme:dark]"
              />
            </div>

            <Button
              onClick={() => {
                if (selectedDate) {
                  handleSaveDate()
                } else {
                  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true")
                  setShowSetupPrompt(false)
                }
              }}
              className="w-full bg-[#378ADD] hover:bg-[#378ADD]/90 text-white font-bold"
            >
              {selectedDate ? "let's go \u2192" : "skip for now \u2192"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit date dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="bg-[#0a2d4a] border-[#378ADD]/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-center">
              Set Your SAT Date
            </DialogTitle>
            <DialogDescription className="text-center text-[#85B7EB] text-sm">
              Choose when you plan to take the SAT.
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

            <Button
              onClick={handleSaveDate}
              disabled={!selectedDate}
              className="w-full bg-[#378ADD] hover:bg-[#378ADD]/90 text-white font-bold disabled:opacity-50"
            >
              Save
            </Button>
            {satDate && (
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY)
                  setSatDate(null)
                  setShowDatePicker(false)
                }}
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                Remove Date
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
