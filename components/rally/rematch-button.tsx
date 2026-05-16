"use client"

import { useState } from "react"
import { Swords, Loader2, Share2, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { createChallenge, getChallengeUrl } from "@/lib/challenges"
import { getChallengePool } from "@/lib/questions"
import { CATEGORY_SHORT } from "@/lib/categories"
import { fetchMyReferralCode } from "@/lib/referrals"
import { toast } from "sonner"

interface RematchButtonProps {
  category: string
  opponentName: string
}

export function RematchButton({ category, opponentName }: RematchButtonProps) {
  const [state, setState] = useState<"idle" | "creating" | "sharing">("idle")
  const [shareCode, setShareCode] = useState<string | null>(null)

  const handleRematch = async () => {
    setState("creating")

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/login?returnTo=%2Fhome"
        return
      }

      const userName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "challenger"

      const pool = await getChallengePool(category)
      if (!pool) {
        toast.error("couldn't load questions — try again")
        setState("idle")
        return
      }

      const code = await createChallenge({
        category,
        creatorName: userName,
        creatorId: user.id,
        questionPool: pool,
      })

      if (!code) {
        toast.error("couldn't create challenge — try again")
        setState("idle")
        return
      }

      const refCode = await fetchMyReferralCode() || undefined
      setShareCode(code)
      setState("sharing")

      const catName = CATEGORY_SHORT[category] || category
      const shareUrl = getChallengeUrl(code, refCode)
      const shareText = `Rematch time! I challenged you to another ${catName} quiz on Rally. Tap the link to play!`

      try {
        if (navigator.share) {
          await navigator.share({
            title: `${userName} wants a rematch on Rally!`,
            text: shareText,
            url: shareUrl,
          })
        } else {
          const subject = encodeURIComponent(`${userName} wants a rematch on Rally!`)
          const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`)
          window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
        }
      } catch {
        // User cancelled share — still let them play
      }

      window.location.href = `/play?creatorChallenge=${code}&category=${encodeURIComponent(category)}`
    } catch (err) {
      console.error("Rematch error:", err)
      toast.error("something went wrong — try again")
      setState("idle")
    }
  }

  if (state === "creating") {
    return (
      <button disabled className="w-full bg-[#0a2d4a] border border-[#378ADD]/40 text-white rounded-xl py-3 px-5 flex items-center justify-center gap-2 font-bold text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-[#378ADD]" />
        creating rematch...
      </button>
    )
  }

  if (state === "sharing") {
    return (
      <button disabled className="w-full bg-[#0a2d4a] border border-[#378ADD]/40 text-white rounded-xl py-3 px-5 flex items-center justify-center gap-2 font-bold text-sm">
        <Share2 className="w-4 h-4 text-[#378ADD]" />
        sending to {opponentName}...
      </button>
    )
  }

  return (
    <button
      onClick={handleRematch}
      className="w-full bg-gradient-to-r from-[#378ADD] to-[#5B9FE6] text-white rounded-xl py-3 px-5 flex items-center justify-center gap-2 font-extrabold text-sm shadow-lg shadow-[#378ADD]/30 active:scale-[0.98] transition-all"
    >
      <Swords className="w-4 h-4" />
      rematch {opponentName}
      <ChevronRight className="w-4 h-4" strokeWidth={3} />
    </button>
  )
}
