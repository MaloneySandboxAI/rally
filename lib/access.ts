import { createClient } from "@/lib/supabase/client"

/**
 * Check if the current user can access challenge mode (premium only).
 * Returns true for active/trialing subscribers, false for free users.
 * Returns null if no user is logged in.
 */
export async function canAccessChallenges(): Promise<boolean | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data: user } = await supabase
    .from("users")
    .select("subscription_status")
    .eq("id", session.user.id)
    .single()

  if (!user) return false

  return ["active", "trialing"].includes(user.subscription_status || "")
}
