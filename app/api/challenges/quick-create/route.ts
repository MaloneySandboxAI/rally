import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { createRouteHandlerClient } from "@/lib/supabase/route"

const CHARS = "abcdefghjkmnpqrstuvwxyz23456789"
function generateShareCode(): string {
  const arr = new Uint8Array(6)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => CHARS[b % CHARS.length]).join("")
}

export async function POST(req: NextRequest) {
  const supabase = createServiceRoleClient()

  // Read caller identity from request cookies (not service-role client)
  const authClient = await createRouteHandlerClient()
  const { data: { user } } = await authClient.auth.getUser()
  const body = await req.json().catch(() => ({}))
  const category: string = body.category || "Algebra"

  // Resolve creator name
  let creatorName = "Anonymous"
  if (user) {
    const meta = user.user_metadata
    creatorName = meta?.display_name || meta?.full_name || meta?.name || user.email?.split("@")[0] || "Anonymous"
  } else if (body.guestName) {
    creatorName = String(body.guestName).trim().slice(0, 30) || "Anonymous"
  }

  // Load previously seen question IDs for this player
  const playerId = user?.id ?? body.guestId
  let seenIds: number[] = []
  if (playerId) {
    const { data: seenRows } = await supabase
      .from("user_seen_questions")
      .select("question_id")
      .eq("player_id", playerId)
    if (seenRows?.length) {
      seenIds = seenRows.map((r: { question_id: number }) => r.question_id)
    }
  }

  // Fetch 5 easy + 5 medium + 5 hard question IDs via true random sampling
  const excludeIds: number[] = [...seenIds, ...(body.excludeIds ?? [])]

  async function sampleWithFallback(difficulty: string) {
    const res = await supabase.rpc("sample_questions", {
      p_category: category, p_difficulty: difficulty, p_n: 5, p_exclude: excludeIds,
    })
    if (res.data && res.data.length >= 5) return res
    // Graceful exhaustion: retry without exclusion
    return supabase.rpc("sample_questions", {
      p_category: category, p_difficulty: difficulty, p_n: 5, p_exclude: [],
    })
  }

  const [easyRes, medRes, hardRes] = await Promise.all([
    sampleWithFallback("easy"),
    sampleWithFallback("medium"),
    sampleWithFallback("hard"),
  ])

  if (!easyRes.data?.length || !medRes.data?.length || !hardRes.data?.length) {
    return NextResponse.json({ error: "Not enough questions for this category" }, { status: 422 })
  }

  const questionIds = [
    ...easyRes.data.map((r: { id: number }) => r.id),
    ...medRes.data.map((r: { id: number }) => r.id),
    ...hardRes.data.map((r: { id: number }) => r.id),
  ]

  // Create challenge with retry on share_code collision
  let shareCode: string | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateShareCode()
    const { error } = await supabase.from("challenges").insert({
      share_code: code,
      category,
      question_ids: questionIds,
      creator_id: user?.id ?? null,
      creator_name: creatorName,
      creator_score: -1,
      creator_results: null,
      challenger_id: null,
      challenger_name: null,
      status: "pending",
    })
    if (!error) { shareCode = code; break }
    if (error.code !== "23505") {
      return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
    }
  }

  if (!shareCode) {
    return NextResponse.json({ error: "Failed to generate unique code" }, { status: 500 })
  }

  // Record these questions as seen for the creator
  if (playerId) {
    const rows = questionIds.map(qid => ({ player_id: playerId, question_id: qid }))
    await supabase
      .from("user_seen_questions")
      .upsert(rows, { onConflict: "player_id,question_id", ignoreDuplicates: true })
      .then(({ error }) => {
        if (error) console.error("[rally] Error recording seen questions:", error)
      })
  }

  const origin = req.headers.get("origin") || "https://rallyplaylive.com"
  return NextResponse.json({
    shareCode,
    shareUrl: `${origin}/c/${shareCode}`,
    playUrl: `${origin}/play?challenge=true&category=${encodeURIComponent(category)}&creatorChallenge=${shareCode}`,
  })
}
