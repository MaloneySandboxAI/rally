"use client"

import { useState, useEffect } from "react"
import { Plus, Swords, ChevronRight, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const CATEGORIES = [
  { id: "Algebra", name: "Algebra", color: "#378ADD" },
  { id: "Reading Comprehension", name: "Reading", color: "#14B8A6" },
  { id: "Grammar", name: "Grammar", color: "#A855F7" },
  { id: "Data & Statistics", name: "Data & Stats", color: "#F97316" },
]

export function ChallengeButton() {
  const [showPicker, setShowPicker] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkedAuth, setCheckedAuth] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      setCheckedAuth(true)
    })
  }, [])

  const handleClick = () => {
    if (!checkedAuth) return
    if (!isLoggedIn) {
      // Redirect to login with a return URL
      window.location.href = "/login?returnTo=challenge"
    } else {
      setShowPicker(true)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    window.location.href = `/play?category=${encodeURIComponent(categoryId)}`
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="relative w-full bg-primary text-primary-foreground rounded-2xl py-4 px-6 flex flex-col items-center justify-center gap-1 font-extrabold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] hover:brightness-110"
        aria-label="Challenge a friend"
      >
        <div className="flex items-center gap-2 text-lg">
          <Plus className="w-5 h-5" strokeWidth={3} />
          challenge a friend
        </div>

        <span className="text-xs font-semibold text-white/70">
          {isLoggedIn ? "4x gems · 100 per correct answer" : "sign in to challenge friends"}
        </span>
      </button>

      {/* Category Picker Bottom Sheet */}
      {showPicker && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setShowPicker(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a2d4a] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Swords className="w-5 h-5 text-[#378ADD]" />
                pick a category
              </h2>
              <button
                onClick={() => setShowPicker(false)}
                className="w-8 h-8 rounded-full bg-[#021f3d] flex items-center justify-center text-[#85B7EB]"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-[#85B7EB]/70 mb-5">
              play a round, then send the challenge link to a friend
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="bg-white rounded-xl p-4 flex flex-col items-start transition-all active:scale-[0.98] hover:shadow-lg"
                  style={{ borderLeft: `4px solid ${cat.color}` }}
                >
                  <span className="text-[#0a1628] font-bold text-sm">{cat.name}</span>
                  <span
                    className="text-xs font-semibold mt-1 flex items-center gap-0.5"
                    style={{ color: cat.color }}
                  >
                    play <ChevronRight className="w-3 h-3" strokeWidth={3} />
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-[#85B7EB]/50">
              after your round, tap &quot;challenge a friend&quot; to create a share link
            </p>
            <div className="h-4" />
          </div>
        </>
      )}
    </>
  )
}
