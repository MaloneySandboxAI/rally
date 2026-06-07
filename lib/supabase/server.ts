import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Service-role Supabase client — bypasses RLS.
 * Use ONLY for admin operations (webhooks, service-level writes).
 * For route handlers that need the caller's identity, use createRouteHandlerClient().
 */
export function createServiceRoleClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

/** @deprecated Use createServiceRoleClient() — this alias exists for migration. */
export const createServerClient = createServiceRoleClient
