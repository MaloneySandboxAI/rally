"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Diamond, Flame, Swords, X, Share2, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getWeeklyRecap, isRecapDismissed, dismissRecap, type WeeklyRecap } from "@/lib/weekly-recap"
import { CATEGORY_SHORT, CATEGORY_COLORS } from "@/lib/categories"

export function WeeklyRecapCard() {
  const [recap, setRecap] = useState<WeeklyRecap | null>(null)
  const [dismissed, setDismissed] = useState(true)
  const [sharing, setSharing] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isRecapDismissed()) return
    setDismissed(false)

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      getWeeklyRecap(session.user.id).then(data => {
        if (data) setRecap(data)
      })
    })
  }, [])

  const handleDismiss = () => {
    dismissRecap()
    setDismissed(true)
  }

  const handleShare = useCallback(async () => {
    if (!recap || !cardRef.current) return
    setSharing(true)

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const w = 390
      const h = 520
      canvas.width = w
      canvas.height = h

      ctx.fillStyle = "#021f3d"
      ctx.fillRect(0, 0, w, h)

      // Header accent bar
      const grad = ctx.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0, "#378ADD")
      grad.addColorStop(1, "#A855F7")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, 4)

      // Title
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 28px system-ui, -apple-system, sans-serif"
      ctx.fillText("my week on Rally", 30, 50)

      ctx.fillStyle = "#85B7EB"
      ctx.font = "14px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${recap.weekStart} – ${recap.weekEnd}`, 30, 74)

      // Win/Loss
      ctx.font = "bold 64px system-ui, -apple-system, sans-serif"
      ctx.fillStyle = "#22C55E"
      const wText = `${recap.wins}W`
      ctx.fillText(wText, 30, 150)
      const wWidth = ctx.measureText(wText).width

      ctx.fillStyle = "#85B7EB40"
      ctx.fillText(" – ", 30 + wWidth, 150)
      const dashWidth = ctx.measureText(" – ").width

      ctx.fillStyle = "#EF4444"
      ctx.fillText(`${recap.losses}L`, 30 + wWidth + dashWidth, 150)

      // Gems earned
      ctx.fillStyle = "#EF9F27"
      ctx.font = "bold 20px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${recap.totalGemsEarned} gems earned`, 30, 190)

      // Divider
      ctx.fillStyle = "#85B7EB20"
      ctx.fillRect(30, 210, w - 60, 1)

      // Stats
      ctx.fillStyle = "#85B7EB"
      ctx.font = "15px system-ui, -apple-system, sans-serif"
      let y = 245

      if (recap.bestWin) {
        const catShort = CATEGORY_SHORT[recap.bestWin.category] || recap.bestWin.category
        ctx.fillText(`Best win: Beat ${recap.bestWin.opponentName} in ${catShort}`, 30, y)
        ctx.fillStyle = "#EF9F27"
        ctx.fillText(` — ${recap.bestWin.gems} gems`, 30 + ctx.measureText(`Best win: Beat ${recap.bestWin.opponentName} in ${catShort}`).width, y)
        ctx.fillStyle = "#85B7EB"
        y += 32
      }

      if (recap.mostPlayedOpponent && recap.mostPlayedOpponent.count >= 2) {
        ctx.fillText(`${recap.mostPlayedOpponent.count} games vs ${recap.mostPlayedOpponent.name}`, 30, y)
        y += 32
      }

      if (recap.mostPlayedCategory) {
        const catShort = CATEGORY_SHORT[recap.mostPlayedCategory.name] || recap.mostPlayedCategory.name
        ctx.fillText(`Top category: ${catShort} (${recap.mostPlayedCategory.count} games)`, 30, y)
        y += 32
      }

      if (recap.winStreak >= 3) {
        ctx.fillStyle = "#EF9F27"
        ctx.font = "bold 18px system-ui, -apple-system, sans-serif"
        ctx.fillText(`🔥 ${recap.winStreak} win streak`, 30, y)
        y += 32
      }

      // Branding
      ctx.fillStyle = "#85B7EB40"
      ctx.font = "bold 14px system-ui, -apple-system, sans-serif"
      ctx.fillText("rallyplaylive.com", 30, h - 24)

      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], "rally-recap.png", { type: "image/png" })
        const shareData: ShareData = {
          title: "My Rally Weekly Recap",
          text: `${recap.wins}W – ${recap.losses}L this week on Rally! ${recap.totalGemsEarned} gems earned.`,
          files: [file],
        }

        try {
          if (navigator.canShare?.(shareData)) {
            await navigator.share(shareData)
          } else if (navigator.share) {
            await navigator.share({ title: shareData.title, text: shareData.text, url: "https://rallyplaylive.com" })
          }
        } catch {}
        setSharing(false)
      }, "image/png")
    } catch {
      setSharing(false)
    }
  }, [recap])

  if (dismissed || !recap) return null

  const catColor = recap.bestWin ? (CATEGORY_COLORS[recap.bestWin.category] || "#378ADD") : "#378ADD"
  const bestCatShort = recap.bestWin ? (CATEGORY_SHORT[recap.bestWin.category] || recap.bestWin.category) : ""

  return (
    <div ref={cardRef} className="bg-[#0a2d4a] rounded-2xl p-4 relative">
      {/* Dismiss */}
      <button onClick={handleDismiss} className="absolute top-3 right-3 text-[#85B7EB]/30 hover:text-[#85B7EB]/60 transition-colors">
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Swords className="w-4 h-4 text-[#378ADD]" />
        <div>
          <h3 className="text-sm font-extrabold text-white leading-tight">your week</h3>
          <p className="text-[10px] text-[#85B7EB]/40">{recap.weekStart} – {recap.weekEnd}</p>
        </div>
      </div>

      {/* Main stats row */}
      <div className="flex items-center gap-4 mb-3">
        {/* W/L record */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-[#22C55E]">{recap.wins}W</span>
          <span className="text-lg font-extrabold text-[#85B7EB]/20">–</span>
          <span className="text-2xl font-extrabold text-[#EF4444]">{recap.losses}L</span>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-1 ml-auto">
          <Diamond className="w-4 h-4 text-[#EF9F27] fill-[#EF9F27]" />
          <span className="text-sm font-extrabold text-white">{recap.totalGemsEarned}</span>
        </div>

        {/* Win streak badge */}
        {recap.winStreak >= 3 && (
          <div className="flex items-center gap-1 bg-[#EF9F27]/15 border border-[#EF9F27]/30 rounded-full px-2 py-0.5">
            <Flame className="w-3 h-3 text-[#EF9F27]" />
            <span className="text-[10px] font-bold text-[#EF9F27]">{recap.winStreak} streak</span>
          </div>
        )}
      </div>

      {/* Detail lines */}
      <div className="space-y-1 mb-3">
        {recap.bestWin && (
          <p className="text-xs text-[#85B7EB]/70">
            <Trophy className="w-3 h-3 inline mr-1" style={{ color: catColor }} />
            Beat {recap.bestWin.opponentName} in <span className="font-bold text-white">{bestCatShort}</span>
            <span className="text-[#EF9F27] font-bold"> — {recap.bestWin.gems} gems</span>
          </p>
        )}
        {recap.mostPlayedOpponent && recap.mostPlayedOpponent.count >= 2 && (
          <p className="text-xs text-[#85B7EB]/70">
            {recap.mostPlayedOpponent.count} games vs <span className="font-bold text-white">{recap.mostPlayedOpponent.name}</span>
          </p>
        )}
      </div>

      {/* Share */}
      <button
        onClick={handleShare}
        disabled={sharing}
        className="w-full bg-[#021f3d] rounded-lg py-2 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Share2 className="w-3.5 h-3.5 text-[#378ADD]" />
        <span className="text-xs font-bold text-[#85B7EB]/70">{sharing ? "creating image..." : "share recap"}</span>
      </button>
    </div>
  )
}
