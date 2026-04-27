"use client"

import { useState, useEffect } from "react"
import { Plus, Swords, ChevronRight, LogIn, Loader2, Share2, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { createChallenge, getChallengeUrl } from "@/lib/challenges"
import { getChallengePool } from "@/lib/questions"
import { usePremium } from "@/lib/premium-context"
import { getFreeChallengesRemaining, useDailyChallenge } from "@/lib/access"
import { toast } from "sonner"

const CATEGORIES = [
  { id: "Algebra", name: "Algebra", color: "#378ADD" },
  { id: "Reading Comprehension", name: "Reading", color: "#14B8A6" },
  { id: "Grammar", name: "Grammar", color: "#A855F7" },
  { id: "Data & Statistics", name: "Data & Stats", color: "#F97316" },
  { id: "AP Biology", name: "AP Bio", color: "#22C55E" },
  { id: "AP Pre Calculus", name: "AP Pre Calc", color: "#EC4899" },
  { id: "AP US History", name: "APUSH", color: "#F59E0B" },
  { id: "AP English Language", name: "AP English", color: "#6366F1" },
]

export function ChallengeButton() {
  const { isPremium } = usePremium()
  const [showPicker, setShowPicker] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  // Challenge creation state
  const [isCreating, setIsCreating] = useState(false)
  const [shareCode, setShareCode] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      setCheckedAuth(true)
      if (session?.user) {
        setUserId(session.user.id)
        setUserName(
          session.user.user_metadata?.display_name ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "challenger"
        )
      }
    })
  }, [])

  const [freeChallengesLeft, setFreeChallengesLeft] = useState(() => getFreeChallengesRemaining())

  const handleClick = () => {
    if (!checkedAuth) return
    if (!isLoggedIn) {
      window.location.href = "/login?returnTo=challenge"
      return
    }
    if (!isPremium && freeChallengesLeft <= 0) {
      window.location.href = "/upgrade?reason=challenges"
      return
    }
    {
      // Reset state for fresh picker
      setShareCode(null)
      setShareUrl(null)
      setLinkShared(false)
      setSelectedCategory(null)
      setIsCreating(false)
      setShowPicker(true)
    }
  }

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    setIsCreating(true)

    try {
      // 1. Fetch shared question pool: 5 easy + 5 medium + 5 hard
      const pool = await getChallengePool(categoryId)
      if (!pool) {
        toast.error("couldn't load questions — try again", {
          style: { background: "#dc2626", border: "none", color: "#ffffff" },
        })
        setIsCreating(false)
        setSelectedCategory(null)
        return
      }

      // 2. Create the challenge with the shared pool
      const code = await createChallenge({
        category: categoryId,
        creatorName: userName,
        creatorId: userId || undefined,
        questionPool: pool,
      })

      if (!code) {
        toast.error("couldn't create challenge — try again", {
          style: { background: "#dc2626", border: "none", color: "#ffffff" },
        })
        setIsCreating(false)
        setSelectedCategory(null)
        return
      }

      // Track free user's daily challenge usage
      if (!isPremium) {
        useDailyChallenge()
        setFreeChallengesLeft(getFreeChallengesRemaining())
      }

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

  // Track whether the link has been shared/copied (gates play button)
  const [linkShared, setLinkShared] = useState(false)

  const handleShareLink = async () => {
    if (!shareUrl) return
    try {
      if (navigator.share) {
        await navigator.share({ title: "Rally Challenge", url: shareUrl })
        setLinkShared(true)
      } else {
        // Desktop fallback: open mailto with the link
        const subject = encodeURIComponent("Rally SAT Challenge")
        const body = encodeURIComponent(`Think you can beat me? Take my challenge:\n${shareUrl}`)
        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
        setLinkShared(true)
      }
    } catch {
      // User cancelled share — that's fine, don't mark as shared
    }
  }

  const handlePlayNow = () => {
    if (!shareCode || !selectedCategory) return
    // Navigate to play page — creator plays adaptive difficulty for this category
    window.location.href = `/play?creatorChallenge=${shareCode}&category=${encodeURIComponent(selectedCategory)}`
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full bg-primary text-primary-foreground rounded-2xl px-4 py-3.5 flex items-center justify-between font-extrabold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] hover:brightness-110"
        aria-label="Challenge a friend"
      >
        <div className="flex items-center gap-2.5">
          {!isPremium && isLoggedIn && freeChallengesLeft <= 0 ? (
            <Lock className="w-5 h-5 shrink-0" strokeWidth={3} />
          ) : (
            <Swords className="w-5 h-5 shrink-0" strokeWidth={2.5} />
          )}
          <div className="min-w-0 text-left">
            <div className="text-sm font-extrabold leading-tight">challenge a friend</div>
            <p className="text-[10px] font-semibold text-white/60 truncate leading-tight">
              {!isLoggedIn
                ? "sign in to challenge"
                : !isPremium && freeChallengesLeft <= 0
                ? "upgrade for more challenges"
                : "earn 4x gems in head-to-head"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
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

            {/* State 3: Share link (must share before playing) */}
            {shareCode && shareUrl && !isCreating && (
              <>
                <p className="text-xs text-[#85B7EB]/60 mb-3">
                  {linkShared
                    ? "link sent! now play your round"
                    : "send this link to your friend to unlock play"}
                </p>

                {/* Share button — must use native share to unlock play */}
                <button
                  onClick={handleShareLink}
                  className="w-full bg-[#021f3d] rounded-lg px-3 py-3 flex items-center justify-center gap-2 active:scale-[0.99] mb-3"
                >
                  <Share2 className="w-4 h-4 text-[#378ADD]" />
                  <span className="text-sm text-white font-semibold">send challenge link</span>
                </button>

                {/* Play now button — ONLY shown after link has been shared/copied */}
                {linkShared ? (
                  <button
                    onClick={handlePlayNow}
                    className="w-full py-3.5 rounded-xl bg-[#378ADD] text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-[#378ADD]/30"
                  >
                    play your round <ChevronRight className="w-5 h-5" strokeWidth={3} />
                  </button>
                ) : (
                  <div className="w-full py-3.5 rounded-xl bg-[#378ADD]/30 text-white/40 font-bold text-base flex items-center justify-center gap-2 cursor-not-allowed">
                    share link to unlock play
                  </div>
                )}

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
