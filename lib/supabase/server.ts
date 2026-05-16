import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Server-side Supabase client using the service role key.
 * Use this in API routes where you need admin-level access (e.g. webhook handlers).
 */
export function createServerClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}
