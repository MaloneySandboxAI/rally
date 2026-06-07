import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cookie-aware Supabase client for route handlers.
 * Reads auth cookies from the request so getUser() returns the caller's identity.
 * Auth token refresh is handled by middleware — this client is read-only for cookies.
 */
export async function createRouteHandlerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Token refresh is handled by middleware
        },
      },
    }
  )
}
