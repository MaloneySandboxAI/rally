"use client"

import { useState } from "react"
import { Zap } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// One-tap challenge creation: uses last-played category (or Algebra),
// copies the share link, then routes creator to play their round.
export function QuickChallengeButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleQuickChallenge() {
    if (loading) return
    setLoading(true)
    try {
      const lastCategory = typeof window !== "undefined"
        ? (localStorage.getItem("rally_last_category") || "Algebra")
        : "Algebra"

      const res = await fetch("/api/challenges/quick-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: lastCategory }),
      })

      if (!res.ok) throw new Error("Failed")
      const { shareUrl, playUrl } = await res.json()

      // Copy link + show toast
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("challenge link copied!", {
          description: shareUrl,
          duration: 5000,
        })
      } catch {
        toast.success("challenge created!", { description: shareUrl, duration: 5000 })
      }

      // Navigate creator to play their round
      router.push(playUrl)
    } catch {
      toast.error("couldn't create challenge — try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleQuickChallenge}
      disabled={loading}
      className="flex items-center gap-1.5 bg-[#EF9F27]/20 border border-[#EF9F27]/30 text-[#EF9F27] rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
    >
      <Zap className="w-3.5 h-3.5" />
      {loading ? "creating..." : "quick challenge"}
    </button>
  )
}
