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

  // Fetch 5 easy + 5 medium + 5 hard question IDs via true random sampling
  const excludeIds: number[] = body.excludeIds ?? []
  const [easyRes, medRes, hardRes] = await Promise.all([
    supabase.rpc("sample_questions", { p_category: category, p_difficulty: "easy", p_n: 5, p_exclude: excludeIds }),
    supabase.rpc("sample_questions", { p_category: category, p_difficulty: "medium", p_n: 5, p_exclude: excludeIds }),
    supabase.rpc("sample_questions", { p_category: category, p_difficulty: "hard", p_n: 5, p_exclude: excludeIds }),
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

  const origin = req.headers.get("origin") || "https://rallyplaylive.com"
  return NextResponse.json({
    shareCode,
    shareUrl: `${origin}/c/${shareCode}`,
    playUrl: `${origin}/play?challenge=true&category=${encodeURIComponent(category)}&creatorChallenge=${shareCode}`,
  })
}
