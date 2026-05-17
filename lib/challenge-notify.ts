"use client"

import { createClient } from "@/lib/supabase/client"
import { CATEGORY_SHORT } from "@/lib/categories"

export async function notifyChallengeOpponent(params: {
  recipientUserId: string
  senderName: string
  category: string
  challengeCode: string
  type: "creator_finished" | "challenger_finished"
}): Promise<void> {
  try {
    const catName = CATEGORY_SHORT[params.category] || params.category
    const isCreatorDone = params.type === "creator_finished"

    const title = isCreatorDone
      ? `${params.senderName} played your challenge!`
      : `${params.senderName} finished the ${catName} challenge!`

    const body = isCreatorDone
      ? `They locked in their ${catName} score. Your turn!`
      : `Tap to see who won!`

    const supabase = createClient()
    supabase.functions.invoke("send-push-notification", {
      body: {
        recipient_user_id: params.recipientUserId,
        title,
        body,
        url: `/challenge/${params.challengeCode}`,
      },
    })
  } catch {
    // Best-effort — don't block gameplay
  }
}
