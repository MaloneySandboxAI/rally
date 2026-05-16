import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Health check endpoint — pinged by cron job to keep Supabase from pausing
// Also useful for uptime monitoring
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })

    if (error) {
      console.error("[health] Supabase error:", error.message)
      return NextResponse.json({ status: "error" }, { status: 500 })
    }

    return NextResponse.json({
      status: "ok",
      supabase: "active",
      waitlist_count: count,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[health] Unexpected error:", err)
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}
