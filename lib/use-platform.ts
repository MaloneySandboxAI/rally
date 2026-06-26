"use client"

import { useEffect, useState } from "react"

/**
 * Returns true when running inside the native iOS app (Capacitor WebView).
 * Returns false in Safari, Chrome, desktop browsers, and during SSR.
 *
 * Use to conditionally hide UI that violates Apple Guideline 3.1.1
 * (e.g., Stripe-backed upgrade entry points) on the iOS app while
 * keeping it visible on web.
 *
 * TESTING TOGGLE (preview/localhost only): append `?fakeios=1` to any URL to
 * simulate the iOS app in a normal browser; `?fakeios=0` clears it. The flag is
 * stored in sessionStorage so it survives in-app navigation and refreshes. It is
 * IGNORED on the production host so real users can never trigger it. Remove this
 * block before/after final QA if you want it gone entirely.
 */
const FAKE_IOS_KEY = "rally_fake_ios"
const PROD_HOSTS = ["rallyplaylive.com", "www.rallyplaylive.com"]

export function useIsNativeIOS(): boolean {
  const [isNativeIOS, setIsNativeIOS] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Capacitor sets window.Capacitor when running inside the native shell.
    // We read it off window directly (instead of importing @capacitor/core) so
    // there's no hard dependency and SSR never touches native APIs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (window as any).Capacitor
    if (cap?.isNativePlatform?.() && cap?.getPlatform?.() === "ios") {
      setIsNativeIOS(true)
      return
    }

    // --- Testing toggle (never active on production host) ---
    if (!PROD_HOSTS.includes(window.location.hostname)) {
      const params = new URLSearchParams(window.location.search)
      const fake = params.get("fakeios")
      if (fake === "1") sessionStorage.setItem(FAKE_IOS_KEY, "true")
      else if (fake === "0") sessionStorage.removeItem(FAKE_IOS_KEY)
      if (sessionStorage.getItem(FAKE_IOS_KEY) === "true") {
        setIsNativeIOS(true)
      }
    }
  }, [])

  return isNativeIOS
}
