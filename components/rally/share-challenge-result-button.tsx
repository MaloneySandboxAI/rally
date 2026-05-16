"use client"

import { useRef, useState } from "react"
import { Share2, Download, Check } from "lucide-react"
import { ChallengeShareCard, type ChallengeShareCardProps } from "./challenge-share-card"

// ============================================================
// SHARE CHALLENGE RESULT BUTTON
// Renders the share card on screen, plus a button that:
//   1) Snapshots the card to PNG via html-to-image (3x pixel ratio for HiDPI)
//   2) Tries navigator.share({files: [pngFile]}) — the native iOS/Android share sheet
//   3) Falls back to downloading the PNG and copying a text summary
// ============================================================

interface ShareButtonProps extends ChallengeShareCardProps {
  /** Hide the card visually — useful if you want a button-only UI and the card just for export. */
  hideCard?: boolean
}

export function ShareChallengeResultButton(props: ShareButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"idle" | "rendering" | "shared" | "downloaded" | "error">("idle")
  const { hideCard, ...cardProps } = props

  const shareUrl = `${
    (typeof window !== "undefined" &&
      (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)) ||
    "https://rallyplaylive.com"
  }/challenge/${cardProps.shareCode}`

  const winnerLine = (() => {
    if (cardProps.creatorGems === cardProps.challengerGems) {
      return `Tie game! ${cardProps.creatorGems}-${cardProps.challengerGems} in ${cardProps.category}.`
    }
    const winnerName =
      cardProps.creatorGems > cardProps.challengerGems
        ? cardProps.creatorName
        : cardProps.challengerName || "friend"
    const high = Math.max(cardProps.creatorGems, cardProps.challengerGems)
    const low = Math.min(cardProps.creatorGems, cardProps.challengerGems)
    return `${winnerName} won ${high}-${low} on ${cardProps.category} in Rally.`
  })()

  const shareText = `${winnerLine} Think you can beat us?`

  async function handleShare() {
    if (!cardRef.current) return
    setStatus("rendering")
    try {
      // Dynamic import keeps html-to-image out of the initial JS bundle.
      const { toPng, toBlob } = await import("html-to-image")
      const node = cardRef.current

      // Try Web Share API with file first — best UX, opens native share sheet
      // and the card travels with the message as a real image attachment.
      if (typeof navigator !== "undefined" && "share" in navigator) {
        try {
          const blob = await toBlob(node, {
            pixelRatio: 3,
            cacheBust: true,
            backgroundColor: "transparent",
          })
          if (blob) {
            const file = new File([blob], `rally-challenge-${cardProps.shareCode}.png`, {
              type: "image/png",
            })
            // Some browsers expose navigator.share but not canShare for files —
            // try the share call and fall through to download on failure.
            const navWithCanShare = navigator as Navigator & {
              canShare?: (data: { files: File[] }) => boolean
            }
            if (!navWithCanShare.canShare || navWithCanShare.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                text: shareText,
                url: shareUrl,
                title: "Rally Challenge Result",
              })
              setStatus("shared")
              setTimeout(() => setStatus("idle"), 1500)
              return
            }
          }
        } catch (err) {
          // User cancelled the share sheet — don't treat as error, just bail.
          if (err instanceof Error && err.name === "AbortError") {
            setStatus("idle")
            return
          }
          // Otherwise fall through to the download fallback below.
        }
      }

      // Fallback: download the PNG and copy text to clipboard.
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "transparent",
      })
      const link = document.createElement("a")
      link.download = `rally-challenge-${cardProps.shareCode}.png`
      link.href = dataUrl
      link.click()
      try {
        await navigator.clipboard?.writeText(`${shareText} ${shareUrl}`)
      } catch {
        // Clipboard might be unavailable — image still downloaded, that's fine.
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
      {/* Card — always rendered (needed for snapshot) but hidden when hideCard */}
      <div
        style={{
          position: hideCard ? "absolute" : "relative",
          left: hideCard ? -9999 : "auto",
          top: hideCard ? -9999 : "auto",
          pointerEvents: hideCard ? "none" : "auto",
        }}
        aria-hidden={hideCard ? true : undefined}
      >
        <ChallengeShareCard ref={cardRef} {...cardProps} />
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        disabled={status === "rendering"}
        className="w-full max-w-sm bg-[#378ADD] hover:bg-[#378ADD]/90 active:scale-[0.98] text-white rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 font-extrabold text-base shadow-lg shadow-[#378ADD]/30 transition-all disabled:opacity-70"
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
            <Share2 className="w-4 h-4" strokeWidth={3} /> share result
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
