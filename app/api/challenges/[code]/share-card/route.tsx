import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { CATEGORY_SHORT } from "@/lib/categories"

export const runtime = "nodejs"

const TAUNTS = {
  victory: [
    "I scored {myScore} gems in {category}. Think you can beat that?",
    "{myScore} gems in {category}. Who's next?",
  ],
  close: [
    "Down to the wire — {myScore} vs {theirScore} in {category}. Can you beat us both?",
    "Too close! {myScore}-{theirScore} in {category}. Your turn.",
  ],
  perfect: ["Perfect score in {category}! Who wants to try?"],
  upset: ["Lost {myScore}-{theirScore} in {category}. Someone avenge me!"],
  pending: [
    "I just scored {myScore} gems in {category} — can you beat me?",
    "Challenged you to {category}. I scored {myScore} gems. Your move.",
  ],
}

function pickTaunt(template: string, vars: Record<string, string>): string {
  const options = TAUNTS[template as keyof typeof TAUNTS] ?? TAUNTS.pending
  const raw = options[Math.floor(Math.random() * options.length)]
  return raw.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "")
}

function getTemplate(myScore: number, theirScore: number | null, total: number): string {
  if (theirScore === null) return "pending"
  if (myScore === total) return "perfect"
  if (myScore < theirScore) return "upset"
  if (Math.abs(myScore - theirScore) <= 30) return "close"
  return "victory"
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const format = req.nextUrl.searchParams.get("format") === "story" ? "story" : "square"
  const width = 1080
  const height = format === "story" ? 1920 : 1080

  const supabase = createServerClient()
  const { data: challenge } = await supabase
    .from("challenges")
    .select("creator_name, creator_score, challenger_name, challenger_score, category, status, share_code")
    .eq("share_code", code)
    .single()

  if (!challenge) {
    return new Response("Not found", { status: 404 })
  }

  const creatorScore = Math.max(0, challenge.creator_score ?? 0)
  const challengerScore = challenge.challenger_score ?? null
  const category = CATEGORY_SHORT[challenge.category] ?? challenge.category
  const shareUrl = `rallyplaylive.com/c/${challenge.share_code}`

  const template = getTemplate(creatorScore, challengerScore, 200)
  const taunt = pickTaunt(template, {
    myScore: String(creatorScore),
    theirScore: String(challengerScore ?? 0),
    category,
    opponent: challenge.challenger_name ?? "friend",
  })

  const creatorWon = challengerScore !== null && creatorScore > challengerScore
  const challengerWon = challengerScore !== null && challengerScore > creatorScore
  const pending = challenge.status === "pending"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(160deg, #021f3d 0%, #0a2d4a 60%, #021f3d 100%)",
          fontFamily: "sans-serif",
          alignItems: "center",
          justifyContent: "center",
          gap: format === "story" ? 56 : 36,
          padding: format === "story" ? "120px 80px" : "80px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: format === "story" ? 72 : 56, fontWeight: 900, color: "#378ADD", letterSpacing: "-2px" }}>
            rally
          </div>
          <div style={{ fontSize: format === "story" ? 24 : 18, color: "#85B7EB", opacity: 0.5 }}>
            SAT &amp; AP prep
          </div>
        </div>

        {/* Score card */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.05)",
            border: "2px solid rgba(55,138,221,0.25)",
            borderRadius: 28,
            padding: format === "story" ? "56px 64px" : "40px 48px",
            alignItems: "center",
            gap: format === "story" ? 64 : 48,
          }}
        >
          {/* Creator */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: format === "story" ? 28 : 22, fontWeight: 700, color: "#85B7EB", maxWidth: 200, textAlign: "center" }}>
              {challenge.creator_name}
            </div>
            <div style={{ fontSize: format === "story" ? 100 : 80, fontWeight: 900, color: creatorWon ? "#EF9F27" : "#ffffff", lineHeight: 1 }}>
              {creatorScore}
            </div>
            <div style={{ fontSize: format === "story" ? 20 : 16, color: "#EF9F27", opacity: 0.8 }}>gems</div>
            {creatorWon && (
              <div style={{ fontSize: 16, fontWeight: 700, color: "#EF9F27", background: "rgba(239,159,39,0.15)", padding: "4px 12px", borderRadius: 999 }}>
                winner
              </div>
            )}
          </div>

          {/* VS divider */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: format === "story" ? 40 : 32, fontWeight: 900, color: "#378ADD", opacity: 0.4 }}>VS</div>
          </div>

          {/* Challenger */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: format === "story" ? 28 : 22, fontWeight: 700, color: "#85B7EB", maxWidth: 200, textAlign: "center" }}>
              {pending ? "???" : (challenge.challenger_name ?? "???")}
            </div>
            <div style={{ fontSize: format === "story" ? 100 : 80, fontWeight: 900, color: challengerWon ? "#EF9F27" : (pending ? "rgba(255,255,255,0.2)" : "#ffffff"), lineHeight: 1 }}>
              {pending ? "?" : (challengerScore ?? 0)}
            </div>
            <div style={{ fontSize: format === "story" ? 20 : 16, color: "#EF9F27", opacity: 0.8 }}>gems</div>
            {challengerWon && (
              <div style={{ fontSize: 16, fontWeight: 700, color: "#EF9F27", background: "rgba(239,159,39,0.15)", padding: "4px 12px", borderRadius: 999 }}>
                winner
              </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div
          style={{
            display: "flex",
            background: "rgba(55,138,221,0.15)",
            border: "2px solid rgba(55,138,221,0.3)",
            borderRadius: 16,
            padding: "10px 24px",
            fontSize: format === "story" ? 28 : 22,
            color: "#378ADD",
            fontWeight: 700,
          }}
        >
          {category}
        </div>

        {/* Taunt */}
        <div
          style={{
            fontSize: format === "story" ? 30 : 24,
            color: "#ffffff",
            textAlign: "center",
            maxWidth: 800,
            opacity: 0.9,
            lineHeight: 1.4,
          }}
        >
          {taunt}
        </div>

        {/* CTA + URL */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: format === "story" ? 22 : 18, color: "#378ADD", fontWeight: 700 }}>
            tap to challenge me
          </div>
          <div style={{ fontSize: format === "story" ? 20 : 16, color: "#85B7EB", opacity: 0.6 }}>
            {shareUrl}
          </div>
        </div>
      </div>
    ),
    { width, height }
  )
}
