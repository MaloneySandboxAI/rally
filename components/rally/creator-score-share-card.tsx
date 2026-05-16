"use client"

import { forwardRef } from "react"
import { Diamond, Swords, Flame } from "lucide-react"

// ============================================================
// CREATOR SCORE SHARE CARD
// The "I just played, now beat me" variant. One player, one big
// score, and a "challenge accepted?" CTA pointing to the challenge URL.
// ============================================================

export interface CreatorScoreShareCardProps {
  creatorName: string
  creatorGems: number
  creatorCorrect: number
  category: string
  shareCode: string
  baseUrl?: string
}

const CATEGORY_SHORT: Record<string, string> = {
  "Algebra": "Algebra",
  "Reading Comprehension": "Reading",
  "Grammar": "Grammar",
  "Data & Statistics": "Data & Stats",
  "AP Biology": "AP Bio",
  "AP Pre Calculus": "AP Pre Calc",
  "AP US History": "APUSH",
  "AP English Language": "AP English",
}

function getBaseUrl(override?: string): string {
  if (override) return override.replace(/^https?:\/\//, "")
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL
    return (envUrl || window.location.origin).replace(/^https?:\/\//, "")
  }
  return "rallyplaylive.com"
}

export const CreatorScoreShareCard = forwardRef<HTMLDivElement, CreatorScoreShareCardProps>(
  function CreatorScoreShareCard(props, ref) {
    const { creatorName, creatorGems, creatorCorrect, category, shareCode, baseUrl } = props
    const categoryLabel = CATEGORY_SHORT[category] || category
    const urlBase = getBaseUrl(baseUrl)

    return (
      <div
        ref={ref}
        style={{
          width: 360,
          height: 450,
          background: "linear-gradient(160deg, #0a2d4a 0%, #021f3d 50%, #050f1f 100%)",
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          color: "#ffffff",
          padding: "20px 20px 18px 20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Soft glow accents */}
        <div
          style={{
            position: "absolute",
            top: -90,
            right: -90,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239,159,39,0.30) 0%, rgba(239,159,39,0) 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(55,138,221,0.20) 0%, rgba(55,138,221,0) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Header — Rally wordmark + category chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Swords size={16} color="#378ADD" strokeWidth={3} />
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: 0.5 }}>RALLY</span>
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#85B7EB",
              background: "rgba(55,138,221,0.18)",
              padding: "4px 10px",
              borderRadius: 999,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Subheadline — "I just scored" tag */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Flame size={14} color="#EF9F27" fill="#EF9F27" strokeWidth={2} />
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#EF9F27",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            just scored
          </div>
          <Flame size={14} color="#EF9F27" fill="#EF9F27" strokeWidth={2} />
        </div>

        {/* Creator name */}
        <div
          style={{
            marginTop: 6,
            fontSize: 26,
            fontWeight: 900,
            lineHeight: 1.05,
            textAlign: "center",
            background: "linear-gradient(180deg, #ffffff 0%, #85B7EB 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            position: "relative",
            zIndex: 1,
            padding: "0 12px",
            wordBreak: "break-word",
          }}
        >
          {creatorName}
        </div>

        {/* Giant gem score */}
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Diamond size={38} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1,
              color: "#EF9F27",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {creatorGems}
          </div>
        </div>
        <div
          style={{
            marginTop: 4,
            textAlign: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(133,183,235,0.7)",
            letterSpacing: 0.3,
            position: "relative",
            zIndex: 1,
          }}
        >
          gems · {creatorCorrect}/5 correct
        </div>

        <div style={{ flex: 1 }} />

        {/* CTA — "can you beat that?" + URL */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            paddingTop: 12,
            borderTop: "1px solid rgba(133,183,235,0.12)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: 0.2,
            }}
          >
            can you beat that?
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#378ADD",
              letterSpacing: 0.3,
            }}
          >
            {urlBase}/challenge/{shareCode}
          </div>
        </div>
      </div>
    )
  },
)
