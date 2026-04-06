import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Health check endpoint — pinged by cron job to keep Supabase from pausing
// Also useful for uptime monitoring
export async function GET() {
  const supabase = createClient(
    "https://rmbzpxvsejbugsgflqsv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYnpweHZzZWpidWdzZ2ZscXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzU2MDEsImV4cCI6MjA5MDgxMTYwMX0.nyDqyCJ0PD42xImxrwY6GbbsfClQMWH_UTHDGvMdfZM"
  )

  try {
    // Simple query to keep Supabase active
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })

    if (error) {
      return NextResponse.json({ status: "error", error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      status: "ok",
      supabase: "active",
      waitlist_count: count,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ status: "error", error: String(err) }, { status: 500 })
  }
}
