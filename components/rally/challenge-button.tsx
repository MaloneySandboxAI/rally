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
        className="relative w-full bg-primary text-primary-foreground rounded-xl py-3 px-5 flex flex-col items-center justify-center gap-0.5 font-extrabold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] hover:brightness-110"
        aria-label="Challenge a friend"
      >
        <div className="flex items-center gap-2 text-base">
          <Plus className="w-4 h-4" strokeWidth={3} />
          challenge a friend
        </div>

        <span className="text-[11px] font-semibold text-white/70">
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
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a2d4a] rounded-t-2xl px-5 pt-4 pb-5 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#378ADD]" />
                {shareCode ? "share your challenge" : "pick a category"}
              </h2>
              <button
                onClick={() => !isCreating && setShowPicker(false)}
                className="w-7 h-7 rounded-full bg-[#021f3d] flex items-center justify-center text-[#85B7EB] text-sm"
              >
                ✕
              </button>
            </div>

            {/* State 1: Category picker */}
            {!shareCode && !isCreating && (
              <>
                <p className="text-xs text-[#85B7EB]/60 mb-3">
                  pick a category, share the link, then play your round
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="bg-white rounded-lg py-3 px-3 flex items-center justify-between active:scale-[0.98]"
                      style={{ borderLeft: `3px solid ${cat.color}` }}
                    >
                      <span className="text-[#0a1628] font-bold text-sm">{cat.name}</span>
                      <ChevronRight className="w-4 h-4" strokeWidth={3} style={{ color: cat.color }} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* State 2: Creating (loading) */}
            {isCreating && (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="w-6 h-6 text-[#378ADD] animate-spin" />
                <p className="text-sm text-[#85B7EB]">creating challenge...</p>
              </div>
            )}

            {/* State 3: Share link + play */}
            {shareCode && shareUrl && !isCreating && (
              <>
                <p className="text-xs text-[#85B7EB]/60 mb-3">
                  send this link to your friend, then tap play
                </p>

                {/* Share link box — tap to copy */}
                <div
                  className="bg-[#021f3d] rounded-lg px-3 py-2.5 flex items-center gap-2 mb-3 cursor-pointer active:scale-[0.99]"
                  onClick={handleCopyLink}
                >
                  <span className="text-xs text-white font-mono flex-1 truncate">{shareUrl}</span>
                  <div className="flex-shrink-0">
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#378ADD]" />
                    )}
                  </div>
                </div>

                {/* Play now button */}
                <button
                  onClick={handlePlayNow}
                  className="w-full py-3.5 rounded-xl bg-[#378ADD] text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-[#378ADD]/30"
                >
                  play your round <ChevronRight className="w-5 h-5" strokeWidth={3} />
                </button>

                <p className="text-center text-[11px] text-[#85B7EB]/40 mt-2">
                  your friend plays the same questions · highest score wins
                </p>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}
