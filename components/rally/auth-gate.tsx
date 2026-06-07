"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { initSync } from "@/lib/sync"

// Pages that are always accessible without auth
const PUBLIC_PATHS = ["/", "/login", "/age-verify", "/setup-profile", "/privacy", "/terms", "/join"]
const PUBLIC_PREFIXES = ["/challenge/", "/group/", "/c/", "/g/", "/upgrade"]

const CHALLENGE_PARAMS = ["challenge", "creatorChallenge", "challengeCode", "group"]

function isPublic(path: string) {
  if (PUBLIC_PATHS.includes(path) || PUBLIC_PREFIXES.some(p => path.startsWith(p))) {
    return true
  }
  if (path === "/play" && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search)
    if (CHALLENGE_PARAMS.some(p => params.has(p))) return true
  }
  return false
}

function isGuestFromCookie(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.split(";").some(c => c.trim().startsWith("rally_is_guest=true"))
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check on public pages
    if (isPublic(pathname)) return

    const supabase = createClient()

    // Use getUser() instead of getSession() — getUser() validates the
    // JWT against the Supabase auth server, which is more reliable on
    // Safari where cookie handling can be flaky.
    supabase.auth.getUser().then(({ data: { user } }) => {
      const isGuest = localStorage.getItem("rally_is_guest") === "true" || isGuestFromCookie()
      if (!user && !isGuest) {
        // Preserve current URL so user returns here after login
        const returnTo = pathname + window.location.search
        router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`)
        return
      }
      // Restore server state on load (logged-in users only)
      if (user) {
        initSync()
      }
      // Enforce age verification for authenticated/guest users
      const ageVerified = localStorage.getItem("rally_age_verified") === "true"
      if (!ageVerified && (user || isGuest)) {
        router.replace("/age-verify")
      }
    })

    // Only redirect on explicit SIGNED_OUT events — not on INITIAL_SESSION
    // or TOKEN_REFRESHED, which can briefly have a null session during
    // OAuth flows and cause login loops.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_OUT") return
      const isGuest = localStorage.getItem("rally_is_guest") === "true" || isGuestFromCookie()
      if (!isGuest && !isPublic(pathname)) {
        router.replace("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  return <>{children}</>
}
