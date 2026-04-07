"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// Pages that are always accessible without auth
const PUBLIC_PATHS = ["/login", "/age-verify", "/setup-profile", "/privacy", "/terms"]
const PUBLIC_PREFIXES = ["/challenge/", "/upgrade"]

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check on public pages
    if (PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return

    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      const isGuest = localStorage.getItem("rally_is_guest") === "true"
      if (!session && !isGuest) {
        router.replace("/login")
        return
      }
      // Enforce age verification for authenticated/guest users
      const ageVerified = localStorage.getItem("rally_age_verified") === "true"
      if (!ageVerified && (session || isGuest)) {
        router.replace("/age-verify")
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isGuest = localStorage.getItem("rally_is_guest") === "true"
      if (!session && !isGuest && !PUBLIC_PATHS.includes(pathname) && !PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
        router.replace("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  return <>{children}</>
}
