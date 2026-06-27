import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { createRouteHandlerClient } from "@/lib/supabase/route"

// Hard-delete the caller's account (Apple Guideline 5.1.1(v)).
//
// We do NOT rely on FK cascades alone: several tables reference auth.users(id)
// with the default NO ACTION rule (challenges, referrals, head_to_head,
// feedback, group_*), and public.users is not created by any migration so its
// delete rule is unknown and prod can drift. So we explicitly clean up every
// table that references the user — anonymizing rows that belong to OTHER players
// (challenges/groups) and deleting the user's own data — and only then call
// auth.admin.deleteUser(), which removes the auth row plus the CASCADE tables
// (user_state, push_subscriptions). This makes the endpoint correct regardless
// of the live FK rules, so no migration has to be applied before it works.

export async function POST() {
  // 1. Identify the caller from their session cookie. Never trust a client-supplied id.
  const authClient = await createRouteHandlerClient()
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const uid = user.id
  const admin = createServiceRoleClient()

  // Run a cleanup step, logging but not throwing on per-table errors (e.g. a
  // table that doesn't exist in this environment, like parent_tokens). The
  // decisive gate is deleteUser() below.
  const cleanupErrors: string[] = []
  async function step(label: string, run: () => Promise<{ error: unknown }>) {
    const { error } = await run()
    if (error) {
      console.warn(`[account/delete] cleanup '${label}':`, error)
      cleanupErrors.push(label)
    }
  }

  // --- Preserve other players' games: anonymize the user's link, keep the row ---
  await step("challenges.creator_id", () =>
    admin.from("challenges").update({ creator_id: null }).eq("creator_id", uid))
  await step("challenges.challenger_id", () =>
    admin.from("challenges").update({ challenger_id: null }).eq("challenger_id", uid))
  await step("group_challenges.creator_id", () =>
    admin.from("group_challenges").update({ creator_id: null }).eq("creator_id", uid))
  await step("group_challenge_entries.player_id", () =>
    admin.from("group_challenge_entries").update({ player_id: null }).eq("player_id", uid))
  await step("feedback.user_id", () =>
    admin.from("feedback").update({ user_id: null }).eq("user_id", uid))
  // users.referred_by references public.users(id) — null it on anyone this user referred
  await step("users.referred_by", () =>
    admin.from("users").update({ referred_by: null }).eq("referred_by", uid))

  // --- Delete the user's own data (NOT NULL FKs / single-owner rows) ---
  await step("head_to_head", () =>
    admin.from("head_to_head").delete().or(`player1_id.eq.${uid},player2_id.eq.${uid}`))
  await step("referrals", () =>
    admin.from("referrals").delete().or(`referrer_id.eq.${uid},referred_id.eq.${uid}`))
  await step("push_subscriptions", () =>
    admin.from("push_subscriptions").delete().eq("user_id", uid))
  await step("user_state", () =>
    admin.from("user_state").delete().eq("user_id", uid))
  await step("parent_tokens", () =>
    admin.from("parent_tokens").delete().eq("user_id", uid))
  // user_seen_questions keys on player_id (text) — auth UUID stored as text, no FK
  await step("user_seen_questions", () =>
    admin.from("user_seen_questions").delete().eq("player_id", uid))
  // public.users last among the tables, before the auth row (referrals/referred_by cleared above)
  await step("public.users", () =>
    admin.from("users").delete().eq("id", uid))

  // 2. Delete the auth.users row itself. This is the compliance-critical step.
  const { error: deleteError } = await admin.auth.admin.deleteUser(uid)
  if (deleteError) {
    console.error("[account/delete] deleteUser failed:", deleteError, "cleanup issues:", cleanupErrors)
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
