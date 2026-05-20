"use client"

import { createClient } from "@/lib/supabase/client"

/**
 * Ask the backend to notify the other participant that a round finished.
 *
 * Only identifiers are sent: the send-push-notification edge function
 * authenticates the caller, verifies they are a participant in this
 * challenge, derives the recipient, and builds the notification content
 * server-side. The recipientUserId / senderName / category params are
 * kept for call-site compatibility but are no longer transmitted.
 */
export async function notifyChallengeOpponent(params: {
  recipientUserId: string
  senderName: string
  category: string
  challengeCode: string
  type: "creator_finished" | "challenger_finished"
}): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.functions.invoke("send-push-notification", {
      body: {
        challenge_code: params.challengeCode,
        type: params.type,
      },
    })
  } catch {
    // Best-effort — don't block gameplay.
  }
}
