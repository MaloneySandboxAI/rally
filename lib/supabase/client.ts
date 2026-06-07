import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (typeof window === "undefined") {
    // Server-side render path — keep behavior unchanged
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  if (client) return client

  // Cookie-based session storage so Safari ITP doesn't purge it after
  // 7 days of no first-party interaction (common when students only
  // click challenge links from iMessage and never type the URL directly).
  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        const match = document.cookie.match(
          new RegExp(
            "(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"
          )
        )
        return match ? decodeURIComponent(match[1]) : undefined
      },
      set(
        name: string,
        value: string,
        options: {
          maxAge?: number
          path?: string
          domain?: string
          sameSite?: string
          secure?: boolean
        } = {}
      ) {
        const parts = [
          `${name}=${encodeURIComponent(value)}`,
          `Path=${options.path ?? "/"}`,
          // 30 days — matches Supabase refresh token lifetime
          `Max-Age=${options.maxAge ?? 60 * 60 * 24 * 30}`,
          `SameSite=${options.sameSite ?? "Lax"}`,
        ]
        if (options.domain) parts.push(`Domain=${options.domain}`)
        if (options.secure ?? location.protocol === "https:") parts.push("Secure")
        document.cookie = parts.join("; ")
      },
      remove(
        name: string,
        options: { path?: string; domain?: string } = {}
      ) {
        document.cookie = `${name}=; Path=${options.path ?? "/"}; Max-Age=0${
          options.domain ? `; Domain=${options.domain}` : ""
        }`
      },
    },
  })

  return client
}
