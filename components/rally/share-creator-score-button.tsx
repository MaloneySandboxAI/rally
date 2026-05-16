"use client"

import { useRef, useState } from "react"
import { Share2, Download, Check } from "lucide-react"
import { CreatorScoreShareCard, type CreatorScoreShareCardProps } from "./creator-score-share-card"

// ============================================================
// SHARE CREATOR SCORE BUTTON
// Renders the solo "I just played, beat me" card to PNG and fires
// the native share sheet. Same plumbing as the head-to-head button
// but with taunt-flavored share text.
// ============================================================

interface ShareCreatorScoreButtonProps extends CreatorScoreShareCardProps {
  hideCard?: boolean
  /** Optional override for the share button label. */
  buttonLabel?: string
}

export function ShareCreatorScoreButton(props: ShareCreatorScoreButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"idle" | "rendering" | "shared" | "downloaded" | "error">("idle")
  const { hideCard, buttonLabel, ...cardProps } = props

  const shareUrl = `${
    (typeof window !== "undefined" &&
      (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)) ||
    "https://rallyplaylive.com"
  }/challenge/${cardProps.shareCode}`

  const shareText = `I scored ${cardProps.creatorGems} gems on ${cardProps.category} in Rally. Can you beat that?`

  async function handleShare() {
    if (!cardRef.current) return
    setStatus("rendering")
    try {
      const { toPng, toBlob } = await import("html-to-image")
      const node = cardRef.current

      if (typeof navigator !== "undefined" && "share" in navigator) {
        try {
          const blob = await toBlob(node, {
            pixelRatio: 3,
            cacheBust: true,
            backgroundColor: "transparent",
          })
          if (blob) {
            const file = new File([blob], `rally-score-${cardProps.shareCode}.png`, {
              type: "image/png",
            })
            const navWithCanShare = navigator as Navigator & {
              canShare?: (data: { files: File[] }) => boolean
            }
            if (!navWithCanShare.canShare || navWithCanShare.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                text: shareText,
                url: shareUrl,
                title: "Rally Challenge",
              })
              setStatus("shared")
              setTimeout(() => setStatus("idle"), 1500)
              return
            }
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            setStatus("idle")
            return
          }
        }
      }

      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "transparent",
      })
      const link = document.createElement("a")
      link.download = `rally-score-${cardProps.shareCode}.png`
      link.href = dataUrl
      link.click()
      try {
        await navigator.clipboard?.writeText(`${shareText} ${shareUrl}`)
      } catch {
        // Clipboard might be unavailable — image still downloaded.
      }
      setStatus("downloaded")
      setTimeout(() => setStatus("idle"), 1800)
    } catch (err) {
      console.error("Share failed:", err)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div
        style={{
          position: hideCard ? "absolute" : "relative",
          left: hideCard ? -9999 : "auto",
          top: hideCard ? -9999 : "auto",
          pointerEvents: hideCard ? "none" : "auto",
        }}
        aria-hidden={hideCard ? true : undefined}
      >
        <CreatorScoreShareCard ref={cardRef} {...cardProps} />
      </div>

      <button
        onClick={handleShare}
        disabled={status === "rendering"}
        className="w-full max-w-sm bg-[#EF9F27] hover:bg-[#EF9F27]/90 active:scale-[0.98] text-[#021f3d] rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 font-extrabold text-base shadow-lg shadow-[#EF9F27]/30 transition-all disabled:opacity-70"
      >
        {status === "rendering" ? (
          <>
            <Share2 className="w-4 h-4 animate-pulse" /> preparing image…
          </>
        ) : status === "shared" ? (
          <>
            <Check className="w-4 h-4" strokeWidth={3} /> shared!
          </>
        ) : status === "downloaded" ? (
          <>
            <Download className="w-4 h-4" strokeWidth={3} /> image saved
          </>
        ) : status === "error" ? (
          <>something went wrong — try again</>
        ) : (
          <>
            <Share2 className="w-4 h-4" strokeWidth={3} /> {buttonLabel || "taunt your friend"}
          </>
        )}
      </button>
      {status === "idle" && (
        <p className="text-[10px] text-[#85B7EB]/40 text-center -mt-1">
          opens your share sheet · image + link
        </p>
      )}
    </div>
  )
}
