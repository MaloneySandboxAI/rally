"use client"

import { useEffect, useState } from "react"

/**
 * Returns true when running inside the native iOS app (Capacitor WebView).
 * Returns false in Safari, Chrome, desktop browsers, and during SSR.
 *
 * Use to conditionally hide UI that violates Apple Guideline 3.1.1
 * (e.g., Stripe-backed upgrade entry points) on the iOS app while
 * keeping it visible on web.
 */
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
    }
  }, [])

  return isNativeIOS
}
