import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  
  if (client) return client
  
  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  return client
}
