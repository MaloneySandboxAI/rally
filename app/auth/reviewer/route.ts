import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Hardcoded reviewer email — the bypass ONLY works for this account, never any other.
const REVIEWER_EMAIL = "reviewer@rallyplaylive.com"

export async function GET(request: Request) {
  // 1. Disable the route entirely if the env var isn't set.
  //    Removing REVIEWER_BYPASS_TOKEN from Vercel disables the bypass cleanly.
  const expectedToken = process.env.REVIEWER_BYPASS_TOKEN
  if (!expectedToken) {
    return new NextResponse("Not found", { status: 404 })
  }

  // 2. Validate the supplied token.
  const { searchParams, origin } = new URL(request.url)
  const providedToken = searchParams.get("token")
  if (!providedToken || providedToken !== expectedToken) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // 3. Use the service-role admin client to generate a magic link for the
  //    reviewer account. This returns a verify URL we can hand off to the
  //    existing /auth/callback handler — no need to reinvent session creation.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: REVIEWER_EMAIL,
  })

  if (error || !data?.properties?.hashed_token) {
    return new NextResponse("Could not generate session", { status: 500 })
  }

  // 4. Redirect to the existing /auth/callback handler with the OTP token.
  //    That handler already calls supabase.auth.verifyOtp and sets the session cookie.
  const callbackUrl = new URL(`${origin}/auth/callback`)
  callbackUrl.searchParams.set("token_hash", data.properties.hashed_token)
  callbackUrl.searchParams.set("type", "magiclink")
  callbackUrl.searchParams.set("returnTo", "/home")
  return NextResponse.redirect(callbackUrl)
}
