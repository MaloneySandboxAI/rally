"use client"

import { useEffect } from "react"
import { initDeepLinks } from "@/lib/capacitor-deep-links"

// Registers the Capacitor Universal Link handler once on app mount.
// No-op outside the native iOS shell.
export function DeepLinkInit() {
  useEffect(() => {
    initDeepLinks()
  }, [])
  return null
}
