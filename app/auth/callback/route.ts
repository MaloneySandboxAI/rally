import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const returnTo = searchParams.get("returnTo")

  // Handle PKCE code exchange (used by OAuth providers)
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rmbzpxvsejbugsgflqsv.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYnpweHZzZWpidWdzZ2ZscXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzU2MDEsImV4cCI6MjA5MDgxMTYwMX0.nyDqyCJ0PD42xImxrwY6GbbsfClQMWH_UTHDGvMdfZM",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore — called from Server Component
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirect to setup-profile, preserving returnTo if present
      const dest = returnTo
        ? `${origin}/setup-profile?returnTo=${encodeURIComponent(returnTo)}`
        : `${origin}/setup-profile`
      return NextResponse.redirect(dest)
    }
  }

  // Handle magic link token hash (email OTP)
  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rmbzpxvsejbugsgflqsv.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtYnpweHZzZWpidWdzZ2ZscXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzU2MDEsImV4cCI6MjA5MDgxMTYwMX0.nyDqyCJ0PD42xImxrwY6GbbsfClQMWH_UTHDGvMdfZM",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "email" | "recovery" | "invite" | "magiclink" | "signup" | "email_change",
    })
    if (!error) {
      const dest = returnTo
        ? `${origin}/setup-profile?returnTo=${encodeURIComponent(returnTo)}`
        : `${origin}/setup-profile`
      return NextResponse.redirect(dest)
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
