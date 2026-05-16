"use client"

import { forwardRef } from "react"
import { Diamond, Crown, Swords } from "lucide-react"

// ============================================================
// CHALLENGE SHARE CARD
// Fixed-size visual designed to be rendered to PNG and shared.
// Dimensions: 360x450 (4:5) — looks crisp in iMessage thumbnails,
// Instagram Stories, etc. Card is rendered at 3x pixelRatio on export.
// ============================================================

export interface ChallengeShareCardProps {
  creatorName: string
  challengerName: string
  creatorGems: number
  challengerGems: number
  creatorCorrect: number
  challengerCorrect: number
  category: string
  shareCode: string
  /** Optional override for the URL shown on the card (defaults to NEXT_PUBLIC_APP_URL or window.location.origin) */
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

export const ChallengeShareCard = forwardRef<HTMLDivElement, ChallengeShareCardProps>(
  function ChallengeShareCard(props, ref) {
    const {
      creatorName,
      challengerName,
      creatorGems,
      challengerGems,
      creatorCorrect,
      challengerCorrect,
      category,
      shareCode,
      baseUrl,
    } = props

    const creatorWon = creatorGems > challengerGems
    const challengerWon = challengerGems > creatorGems
    const tied = creatorGems === challengerGems
    const winnerName = creatorWon ? creatorName : challengerWon ? challengerName : null
    const categoryLabel = CATEGORY_SHORT[category] || category
    const urlBase = getBaseUrl(baseUrl)

    return (
      <div
        ref={ref}
        // Fixed pixel size so PNG output is deterministic.
        // Using inline styles for everything that affects layout/rendering
        // because html-to-image is more reliable with explicit values than Tailwind classes.
        style={{
          width: 360,
          height: 450,
          background: "linear-gradient(160deg, #0a2d4a 0%, #021f3d 50%, #050f1f 100%)",
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
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
            top: -80,
            right: -80,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(55,138,221,0.25) 0%, rgba(55,138,221,0) 70%)",
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
            background: "radial-gradient(circle, rgba(239,159,39,0.18) 0%, rgba(239,159,39,0) 70%)",
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

        {/* Headline */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {tied ? (
            <>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#EF9F27",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Challenge Complete
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  textAlign: "center",
                  background: "linear-gradient(180deg, #ffffff 0%, #85B7EB 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Tie game!
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Crown size={16} color="#EF9F27" fill="#EF9F27" strokeWidth={2} />
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#EF9F27",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  Winner
                </div>
                <Crown size={16} color="#EF9F27" fill="#EF9F27" strokeWidth={2} />
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  textAlign: "center",
                  background: "linear-gradient(180deg, #ffffff 0%, #EF9F27 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  maxWidth: 320,
                  wordBreak: "break-word",
                }}
              >
                {winnerName}
              </div>
            </>
          )}
        </div>

        {/* Score row */}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: 10,
            position: "relative",
            zIndex: 1,
          }}
        >
          <PlayerColumn
            name={creatorName}
            gems={creatorGems}
            correct={creatorCorrect}
            isWinner={creatorWon}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 14,
              fontWeight: 900,
              color: "rgba(133,183,235,0.4)",
              letterSpacing: 1,
            }}
          >
            VS
          </div>
          <PlayerColumn
            name={challengerName || "friend"}
            gems={challengerGems}
            correct={challengerCorrect}
            isWinner={challengerWon}
          />
        </div>

        {/* Spacer pushes footer to bottom */}
        <div style={{ flex: 1 }} />

        {/* Footer — URL + sub-tagline */}
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
              fontSize: 10,
              color: "rgba(133,183,235,0.55)",
              letterSpacing: 0.4,
            }}
          >
            think you can beat us?
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

function PlayerColumn({
  name,
  gems,
  correct,
  isWinner,
}: {
  name: string
  gems: number
  correct: number
  isWinner: boolean
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 8px 10px 8px",
        borderRadius: 14,
        background: isWinner ? "rgba(239,159,39,0.12)" : "rgba(255,255,255,0.03)",
        border: isWinner
          ? "1px solid rgba(239,159,39,0.45)"
          : "1px solid rgba(133,183,235,0.10)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: isWinner ? "#EF9F27" : "rgba(133,183,235,0.75)",
          marginBottom: 4,
          maxWidth: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: 0.2,
        }}
      >
        {name}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 2,
        }}
      >
        <Diamond
          size={18}
          color="#F59E0B"
          fill="#F59E0B"
          strokeWidth={2}
        />
        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            lineHeight: 1,
            color: isWinner ? "#EF9F27" : "#ffffff",
          }}
        >
          {gems}
        </div>
      </div>
      <div
        style={{
          fontSize: 10,
          color: "rgba(133,183,235,0.55)",
          fontWeight: 600,
        }}
      >
        {correct}/5 correct
      </div>
    </div>
  )
}
