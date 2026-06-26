"use client"

import { useState, useEffect } from "react"
import { Plus, Swords, ChevronRight, LogIn, Loader2, Share2, Lock, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { createChallenge, getChallengeUrl } from "@/lib/challenges"
import { getChallengePool } from "@/lib/questions"
import { usePremium } from "@/lib/premium-context"
import { useIsNativeIOS } from "@/lib/use-platform"
import { getFreeChallengesRemaining, useDailyChallenge } from "@/lib/access"
import { toast } from "sonner"
import { SAT_CATEGORIES, AP_CATEGORIES } from "@/lib/categories"
import { fetchMyReferralCode } from "@/lib/referrals"
import { RecentOpponents } from "./recent-opponents"
import { type RecentOpponent } from "@/lib/recent-opponents"
import { createGroupChallenge, getGroupChallengeUrl } from "@/lib/group-challenges"

export function ChallengeButton({ mode = "sat" }: { mode?: "sat" | "ap" }) {
  const categories = mode === "ap" ? AP_CATEGORIES : SAT_CATEGORIES
  const { isPremium } = usePremium()
  // No Stripe upgrade redirect inside the iOS app (Apple Guideline 3.1.1)
  const isNativeIOS = useIsNativeIOS()
  const [showPicker, setShowPicker] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  // Challenge creation state
  const [challengeMode, setChallengeMode] = useState<"1v1" | "group">("1v1")
  const [isCreating, setIsCreating] = useState(false)
  const [shareCode, setShareCode] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedOpponent, setSelectedOpponent] = useState<RecentOpponent | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
      setCheckedAuth(true)
      if (user) {
        setUserId(user.id)
        setUserName(
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "challenger"
        )
      }
    })
  }, [])

  const [freeChallengesLeft, setFreeChallengesLeft] = useState(() => getFreeChallengesRemaining())

  const handleClick = () => {
    if (!checkedAuth) return
    if (!isLoggedIn) {
      window.location.href = "/login?returnTo=%2Fhome"
      return
    }
    if (!isPremium && freeChallengesLeft <= 0) {
      if (isNativeIOS) {
        // Apple Guideline 3.1.1: no upgrade upsell on iOS — just inform.
        toast("you've used your free challenges for today", {
          description: "come back tomorrow to challenge again",
          duration: 5000,
        })
      } else {
        window.location.href = "/upgrade?reason=challenges"
      }
      return
    }
    {
      // Reset state for fresh picker
      setShareCode(null)
      setShareUrl(null)
      setLinkShared(false)
      setSelectedCategory(null)
      setSelectedOpponent(null)
      setChallengeMode("1v1")
      setIsCreating(false)
      setShowPicker(true)
    }
  }

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    setIsCreating(true)

    try {
      const pool = await getChallengePool(categoryId)
      if (!pool) {
        toast.error("couldn't load questions — try again", {
          style: { background: "#dc2626", border: "none", color: "#ffffff" },
        })
        setIsCreating(false)
        setSelectedCategory(null)
        return
      }

      let code: string | null

      if (challengeMode === "group") {
        if (!userId) {
          toast.error("sign in to create a group challenge")
          setIsCreating(false)
          setSelectedCategory(null)
          return
        }
        code = await createGroupChallenge({
          category: categoryId,
          creatorName: userName,
          creatorId: userId,
          questionPool: pool,
        })
      } else {
        code = await createChallenge({
          category: categoryId,
          creatorName: userName,
          creatorId: userId || undefined,
          questionPool: pool,
          targetChallengerId: selectedOpponent?.id,
          targetChallengerName: selectedOpponent?.name,
        })
      }

      if (!code) {
        toast.error("couldn't create challenge — try again", {
          style: { background: "#dc2626", border: "none", color: "#ffffff" },
        })
        setIsCreating(false)
        setSelectedCategory(null)
        return
      }

      if (!isPremium) {
        useDailyChallenge()
        setFreeChallengesLeft(getFreeChallengesRemaining())
      }

      if (challengeMode === "group") {
        setShareCode(code)
        setShareUrl(getGroupChallengeUrl(code))
      } else {
        const refCode = await fetchMyReferralCode() || undefined
        setShareCode(code)
        setShareUrl(getChallengeUrl(code, refCode))
      }
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
      const catName = selectedCategory ? categories.find(c => c.id === selectedCategory)?.name || "" : ""
      const shareText = challengeMode === "group"
        ? `Join my ${catName} group challenge on Rally! Up to 30 players — see who tops the leaderboard.`
        : selectedOpponent
        ? `${selectedOpponent.name.split(" ")[0]}, I challenged you to a ${catName} quiz on Rally! Tap the link to play!`
        : `Think you can beat me? I challenged you to a ${catName} quiz on Rally. Tap the link to play!`
      if (navigator.share) {
        await navigator.share({
          title: `${userName} challenged you on Rally!`,
          text: shareText,
          url: shareUrl,
        })
        setLinkShared(true)
      } else {
        // Desktop fallback: open mailto with the link
        const subject = encodeURIComponent(`${userName} challenged you on Rally!`)
        const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`)
        window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
        setLinkShared(true)
      }
    } catch {
      // User cancelled share — that's fine, don't mark as shared
    }
  }

  const handlePlayNow = () => {
    if (!shareCode || !selectedCategory) return
    if (challengeMode === "group") {
      window.location.href = `/play?group=${shareCode}&category=${encodeURIComponent(selectedCategory)}`
    } else {
      window.location.href = `/play?creatorChallenge=${shareCode}&category=${encodeURIComponent(selectedCategory)}`
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full bg-gradient-to-r from-[#378ADD] to-[#5B9FE6] text-white rounded-2xl px-5 py-4 flex items-center justify-between font-extrabold shadow-xl shadow-[#378ADD]/40 transition-all active:scale-[0.97] hover:brightness-110"
        aria-label="Challenge a friend"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            {!isPremium && isLoggedIn && freeChallengesLeft <= 0 ? (
              <Lock className="w-5 h-5" strokeWidth={3} />
            ) : (
              <Swords className="w-5 h-5" strokeWidth={2.5} />
            )}
          </div>
          <div className="min-w-0 text-left">
            <div className="text-base font-extrabold leading-tight">
              {!isLoggedIn
                ? "sign in to challenge"
                : !isPremium && freeChallengesLeft <= 0
                ? (isNativeIOS ? "out of challenges today" : "upgrade for challenges")
                : "start a challenge"}
            </div>
            <p className="text-[11px] font-semibold text-white/60 truncate leading-tight mt-0.5">
              {!isLoggedIn
                ? "compete head-to-head with friends"
                : !isPremium && freeChallengesLeft <= 0
                ? (isNativeIOS ? "come back tomorrow for more challenges" : "get unlimited challenges with premium")
                : "1v1 or group · same questions · most gems wins"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/70 shrink-0" strokeWidth={3} />
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
                {/* Mode toggle: 1v1 vs Group */}
                <div className="flex bg-[#021f3d] rounded-lg p-0.5 mb-3">
                  <button
                    onClick={() => setChallengeMode("1v1")}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      challengeMode === "1v1" ? "bg-[#378ADD] text-white" : "text-[#85B7EB]/50"
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" /> 1v1
                  </button>
                  <button
                    onClick={() => { setChallengeMode("group"); setSelectedOpponent(null) }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      challengeMode === "group" ? "bg-[#378ADD] text-white" : "text-[#85B7EB]/50"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> group
                  </button>
                </div>

                {/* Recent opponents row (1v1 only) */}
                {challengeMode === "1v1" && (
                  <RecentOpponents
                    userId={userId}
                    selectedId={selectedOpponent?.id}
                    onSelect={(opp) => setSelectedOpponent(prev => prev?.id === opp.id ? null : opp)}
                  />
                )}

                <p className="text-xs text-[#85B7EB]/60 mb-3">
                  {challengeMode === "group"
                    ? "pick a category — share with your class or group"
                    : selectedOpponent
                    ? `pick a category to challenge ${selectedOpponent.name.split(" ")[0]}`
                    : "pick a category, share the link, then play your round"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
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
