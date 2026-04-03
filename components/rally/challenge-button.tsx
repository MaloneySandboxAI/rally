"use client"

import { useState, useEffect } from "react"
import { Plus, Swords, ChevronRight, LogIn, Copy, Check, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getQuestions } from "@/lib/questions"
import { createChallenge, getChallengeUrl } from "@/lib/challenges"
import { toast } from "sonner"

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
  const [userName, setUserName] = useState("")

  // Challenge creation state
  const [isCreating, setIsCreating] = useState(false)
  const [shareCode, setShareCode] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      setCheckedAuth(true)
      if (session?.user) {
        setUserName(
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "challenger"
        )
      }
    })
  }, [])

  const handleClick = () => {
    if (!checkedAuth) return
    if (!isLoggedIn) {
      window.location.href = "/login?returnTo=challenge"
    } else {
      // Reset state for fresh picker
      setShareCode(null)
      setShareUrl(null)
      setCopied(false)
      setSelectedCategory(null)
      setIsCreating(false)
      setShowPicker(true)
    }
  }

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    setIsCreating(true)

    try {
      // 1. Fetch 5 random questions for this category
      const questions = await getQuestions(categoryId)
      if (!questions || questions.length === 0) {
        toast.error("couldn't load questions — try again", {
          style: { background: "#dc2626", border: "none", color: "#ffffff" },
        })
        setIsCreating(false)
        setSelectedCategory(null)
        return
      }

      const questionIds = questions.map((q) => q.id)

      // 2. Create the challenge in Supabase (no results yet)
      const code = await createChallenge({
        category: categoryId,
        questionIds,
        creatorName: userName,
      })

      if (!code) {
        toast.error("couldn't create challenge — try again", {
          style: { background: "#dc2626", border: "none", color: "#ffffff" },
        })
        setIsCreating(false)
        setSelectedCategory(null)
        return
      }

      // 3. Show the share link
      setShareCode(code)
      setShareUrl(getChallengeUrl(code))
      setIsCreating(false)
    } catch (err) {
      console.error("Error creating challenge:", err)
      toast.error("something went wrong — try again", {
        style: { background: "#dc2626", border: "none", color: "#ffffff" },
      })
      setIsCreating(false)
      setSelectedCategory(null)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("link copied!", {
        style: { background: "#16a34a", border: "none", color: "#ffffff" },
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for clipboard API failure
      toast.error("couldn't copy — long press the link to copy", {
        style: { background: "#dc2626", border: "none", color: "#ffffff" },
      })
    }
  }

  const handlePlayNow = () => {
    if (!shareCode) return
    // Navigate to play page with creatorChallenge param
    window.location.href = `/play?creatorChallenge=${shareCode}`
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

      {/* Bottom Sheet */}
      {showPicker && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => !isCreating && setShowPicker(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a2d4a] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            {/* Close button */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Swords className="w-5 h-5 text-[#378ADD]" />
                {shareCode ? "share your challenge" : "pick a category"}
              </h2>
              <button
                onClick={() => !isCreating && setShowPicker(false)}
                className="w-8 h-8 rounded-full bg-[#021f3d] flex items-center justify-center text-[#85B7EB]"
              >
                ✕
              </button>
            </div>

            {/* State 1: Category picker */}
            {!shareCode && !isCreating && (
              <>
                <p className="text-sm text-[#85B7EB]/70 mb-5">
                  pick a category, share the link, then play your round
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
              </>
            )}

            {/* State 2: Creating challenge (loading) */}
            {isCreating && (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-[#378ADD] animate-spin mb-3" />
                <p className="text-sm text-[#85B7EB]">creating your challenge...</p>
              </div>
            )}

            {/* State 3: Share link + play button */}
            {shareCode && shareUrl && !isCreating && (
              <>
                <p className="text-sm text-[#85B7EB]/70 mb-5">
                  send this link to your friend, then tap play to start your round
                </p>

                {/* Share link box */}
                <div
                  className="bg-[#021f3d] rounded-xl p-4 flex items-center gap-3 mb-4 cursor-pointer transition-all active:scale-[0.99]"
                  onClick={handleCopyLink}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#85B7EB]/60 mb-1">challenge link</p>
                    <p className="text-sm text-white font-mono truncate">{shareUrl}</p>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#378ADD]/20 flex items-center justify-center">
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-[#378ADD]" />
                    )}
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 rounded-xl bg-[#021f3d] border border-[#378ADD]/30 text-[#378ADD] font-bold text-sm mb-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> copy link
                    </>
                  )}
                </button>

                {/* Play now button */}
                <button
                  onClick={handlePlayNow}
                  className="w-full py-4 rounded-2xl bg-[#378ADD] text-white font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:brightness-110 shadow-lg shadow-[#378ADD]/30"
                >
                  play your round <ChevronRight className="w-5 h-5" strokeWidth={3} />
                </button>

                <p className="text-center text-xs text-[#85B7EB]/50 mt-4">
                  your friend plays the same questions · highest score wins
                </p>
              </>
            )}

            <div className="h-4" />
          </div>
        </>
      )}
    </>
  )
}
