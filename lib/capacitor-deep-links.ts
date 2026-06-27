"use client"

// Capacitor deep-link handler — when iOS opens a Universal Link
// (e.g. rallyplaylive.com/challenge/ABC), this routes the user to the
// matching page inside the Rally app so they stay logged in.
//
// We reach the Capacitor App plugin through the global `window.Capacitor`
// bridge (injected by the native shell) instead of importing `@capacitor/app`
// / `@capacitor/core`. This matches the rest of the codebase (see
// `lib/use-platform.ts`), keeps the web bundle free of a hard Capacitor
// dependency, and stays SSR-safe. The native iOS project still needs the
// @capacitor/app plugin installed for `appUrlOpen` to fire (see CLAUDE.md).

export function initDeepLinks() {
  if (typeof window === "undefined") return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor
  if (!cap?.isNativePlatform?.()) return

  const App = cap?.Plugins?.App
  if (!App?.addListener) return

  App.addListener("appUrlOpen", (event: { url: string }) => {
    try {
      const url = new URL(event.url)
      // Only handle our domain
      if (!url.hostname.endsWith("rallyplaylive.com")) return
      // Use the pathname + search as the in-app destination
      const dest = url.pathname + url.search
      // Use window.location so the auth-gate runs on the destination route
      window.location.replace(dest)
    } catch {
      // Ignore malformed URLs
    }
  })
}
