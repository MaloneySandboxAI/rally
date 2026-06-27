"use client"

import { createClient } from "@/lib/supabase/client"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

/**
 * Sign in with Apple — uses the native iOS sheet inside the Capacitor app
 * and Supabase's web OAuth flow everywhere else.
 *
 * The native flow gives Face ID / Touch ID in ~2 seconds, no browser redirect.
 * The web flow takes the user to https://appleid.apple.com/auth/authorize,
 * back to Supabase, then back to Rally.
 *
 * We reach the native Sign in with Apple plugin through the global
 * `window.Capacitor.Plugins.SignInWithApple` bridge (injected by the native
 * shell) instead of importing `@capacitor-community/apple-sign-in` /
 * `@capacitor/core`. This matches the rest of the codebase (see
 * `lib/use-platform.ts` and `lib/capacitor-deep-links.ts`), keeps the web
 * bundle free of a hard Capacitor dependency, and stays SSR-safe. The native
 * iOS project still needs the plugin installed for the bridge to exist
 * (`pnpm add @capacitor-community/apple-sign-in` + `npx cap sync ios` — see
 * CLAUDE.md).
 *
 * @param redirectTo - optional post-sign-in callback URL (preserves returnTo)
 */
export async function signInWithApple(
  redirectTo?: string,
): Promise<{ error: Error | null }> {
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = typeof window !== "undefined" ? (window as any).Capacitor : undefined
  const isNativeIOS =
    cap?.isNativePlatform?.() && cap?.getPlatform?.() === "ios"

  if (isNativeIOS) {
    try {
      const SignInWithApple = cap?.Plugins?.SignInWithApple
      if (!SignInWithApple?.authorize) {
        return {
          error: new Error(
            "Apple sign-in is unavailable — the native plugin isn't installed.",
          ),
        }
      }

      const result = await SignInWithApple.authorize({
        clientId: "com.rallyplaylive.app", // the app's Bundle ID for native flow
        redirectURI: `${SUPABASE_URL}/auth/v1/callback`,
        scopes: "email name",
      })

      const identityToken = result?.response?.identityToken
      if (!identityToken) {
        return { error: new Error("Apple sign-in returned no identity token.") }
      }

      // Pass the identity token to Supabase to create a session
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: identityToken,
      })
      return { error }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) }
    }
  }

  // Web / Android — standard Supabase OAuth redirect flow
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
    },
  })
  return { error }
}
