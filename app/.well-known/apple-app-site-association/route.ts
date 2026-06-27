import { NextResponse } from "next/server"

// Apple App Site Association — enables Universal Links so iOS opens
// rallyplaylive.com URLs directly in the Rally app instead of Safari.
//
// Required: set APPLE_TEAM_ID in Vercel env (Production + Preview) to the
// 10-char Apple Team ID from https://developer.apple.com → Membership Details.
// Bundle ID is from capacitor.config.ts (com.rallyplaylive.app).
//
// Served at: https://www.rallyplaylive.com/.well-known/apple-app-site-association
// Apple validator: https://search.developer.apple.com/appsearch-validation-tool/

// Read the team ID at request time so a Vercel env change is reflected on the
// next request without needing a fresh build.
export const dynamic = "force-dynamic"

export async function GET() {
  const TEAM_ID = process.env.APPLE_TEAM_ID || "REPLACE_WITH_TEAM_ID"
  const BUNDLE_ID = "com.rallyplaylive.app"

  const aasa = {
    applinks: {
      details: [
        {
          appIDs: [`${TEAM_ID}.${BUNDLE_ID}`],
          components: [
            // Routes that should open in the app
            { "/": "/challenge/*", comment: "Challenge accept links" },
            { "/": "/group/*", comment: "Group challenge links" },
            { "/": "/c/*", comment: "Short challenge links" },
            { "/": "/g/*", comment: "Short group links" },
            { "/": "/join", comment: "Referral join links" },
            { "/": "/home", comment: "Direct app open" },
          ],
        },
      ],
    },
  }

  return NextResponse.json(aasa, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
