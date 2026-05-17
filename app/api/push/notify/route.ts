import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import * as webpush from "web-push"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 })
    }
    webpush.setVapidDetails("mailto:maloney@evaine.ai", publicKey, privateKey)
    const { recipientUserId, title, body, url, tag } = await req.json()

    if (!recipientUserId || !title || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: sub } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", recipientUserId)
      .single()

    if (!sub?.subscription) {
      return NextResponse.json({ sent: false, reason: "no_subscription" })
    }

    const subscription = JSON.parse(sub.subscription)
    const payload = JSON.stringify({ title, body, url, tag })

    await webpush.sendNotification(subscription, payload)

    return NextResponse.json({ sent: true })
  } catch (err: unknown) {
    const isExpired = err instanceof webpush.WebPushError && err.statusCode === 410
    if (isExpired) {
      const { recipientUserId } = await req.clone().json().catch(() => ({}))
      if (recipientUserId) {
        const supabase = createServerClient()
        await supabase.from("push_subscriptions").delete().eq("user_id", recipientUserId)
      }
      return NextResponse.json({ sent: false, reason: "subscription_expired" })
    }

    console.error("[push] Send error:", err)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
