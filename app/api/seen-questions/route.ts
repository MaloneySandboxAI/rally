import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { createRouteHandlerClient } from "@/lib/supabase/route"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const questionIds: number[] = body.questionIds
  const guestId: string | undefined = body.guestId

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return NextResponse.json({ error: "questionIds required" }, { status: 400 })
  }

  const authClient = await createRouteHandlerClient()
  const { data: { user } } = await authClient.auth.getUser()
  const playerId = user?.id ?? guestId

  if (!playerId) {
    return NextResponse.json({ error: "No player identity" }, { status: 400 })
  }

  const supabase = createServiceRoleClient()
  const rows = questionIds.map(qid => ({
    player_id: playerId,
    question_id: qid,
  }))

  const { error } = await supabase
    .from("user_seen_questions")
    .upsert(rows, { onConflict: "player_id,question_id", ignoreDuplicates: true })

  if (error) {
    console.error("[rally] Error recording seen questions:", error)
    return NextResponse.json({ error: "Failed to record" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get("playerId")
  const category = req.nextUrl.searchParams.get("category")

  if (!playerId) {
    return NextResponse.json({ ids: [] })
  }

  const supabase = createServiceRoleClient()

  let query = supabase
    .from("user_seen_questions")
    .select("question_id")
    .eq("player_id", playerId)

  if (category) {
    query = query.in(
      "question_id",
      supabase.from("sat_questions").select("id").eq("category", category)
    )
  }

  const { data, error } = await query

  if (error) {
    console.error("[rally] Error loading seen questions:", error)
    return NextResponse.json({ ids: [] })
  }

  return NextResponse.json({ ids: (data || []).map((r: { question_id: number }) => r.question_id) })
}
