"use client"

import { useState, useEffect } from "react"
import { Sparkles, Share2, Users, Diamond, Loader2 } from "lucide-react"
import { fetchMyReferralCode, getCachedReferralCode, getReferralLink, getReferralStats, claimReferralBonuses } from "@/lib/referrals"
import { useGems, GEM_ECONOMY } from "@/lib/gem-context"
import { toast } from "sonner"

export function ReferralBanner() {
  const { addGems } = useGems()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{ totalReferred: number; completedReferrals: number; pendingReferrals: number } | null>(null)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    // Try cached first for instant display
    const cached = getCachedReferralCode()
    if (cached) setReferralCode(cached)

    // Then fetch fresh from Supabase
    fetchMyReferralCode().then(code => {
      if (code) setReferralCode(code)
    })

    // Check for unclaimed referral bonuses
    claimReferralBonuses(addGems).then(bonus => {
      if (bonus > 0) {
        toast.success(`+${bonus} gems from referral bonus!`, {
          duration: 4000,
          style: { background: '#16a34a', border: 'none', color: '#ffffff' },
        })
      }
    })
  }, [addGems])

  const handleShare = async () => {
    if (!referralCode) {
      setLoading(true)
      const code = await fetchMyReferralCode()
      setLoading(false)
      if (!code) {
        toast.error("couldn't generate your referral link — try again", { duration: 2000 })
        return
      }
      setReferralCode(code)
      shareLink(code)
    } else {
      shareLink(referralCode)
    }
  }

  const shareLink = async (code: string) => {
    const link = getReferralLink(code)
    const shareData = {
      title: "Rally — SAT Prep",
      text: `Join me on Rally and we both get ${GEM_ECONOMY.referralBonus} bonus gems! 💎`,
      url: link,
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled share — that's fine
      }
    } else {
      // Desktop fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(link)
        toast.success("referral link copied!", { duration: 2000 })
      } catch {
        // Fallback mailto
        window.open(`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + "\n" + link)}`)
      }
    }
  }

  const handleShowStats = async () => {
    if (showStats) {
      setShowStats(false)
      return
    }
    const s = await getReferralStats()
    setStats(s)
    setShowStats(true)
  }

  return (
    <div className="space-y-2">
      {/* Main share button */}
      <button
        onClick={handleShare}
        disabled={loading}
        className="w-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-[#F59E0B]/20 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-[#F59E0B] animate-spin" />
        ) : (
          <Share2 className="w-4 h-4 text-[#F59E0B]" />
        )}
        <span className="text-sm font-semibold text-white">
          refer a friend · earn {GEM_ECONOMY.referralBonus} bonus gems each
        </span>
      </button>

      {/* Stats toggle */}
      <button
        onClick={handleShowStats}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[#85B7EB]/40 text-xs font-medium hover:text-[#85B7EB]/60 transition-colors"
      >
        <Users className="w-3 h-3" />
        <span>{showStats ? "hide referral stats" : "view referral stats"}</span>
      </button>

      {/* Stats panel */}
      {showStats && stats && (
        <div className="bg-[#0a2d4a] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#85B7EB]/70 text-xs">friends referred</span>
            <span className="text-white font-bold text-xs">{stats.totalReferred}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#85B7EB]/70 text-xs">completed (played a round)</span>
            <span className="text-green-400 font-bold text-xs">{stats.completedReferrals}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#85B7EB]/70 text-xs">pending (signed up, hasn't played)</span>
            <span className="text-[#F59E0B] font-bold text-xs">{stats.pendingReferrals}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#85B7EB]/10 pt-2">
            <span className="text-[#85B7EB]/70 text-xs">total gems earned</span>
            <div className="flex items-center gap-1">
              <Diamond className="w-3 h-3 text-[#EF9F27] fill-[#EF9F27]" />
              <span className="text-[#EF9F27] font-bold text-xs">{stats.completedReferrals * GEM_ECONOMY.referralBonus}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
