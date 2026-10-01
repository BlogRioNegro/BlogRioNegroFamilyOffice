import 'server-only'
import type { Database } from '@rio-negro/db'
import { createClient } from '@supabase/supabase-js'
import { env } from '../env'

// Ignora RLS: usar só onde a spec exige a service role (insert de lead, rate limit, URL assinada).
export function createServiceRoleClient() {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
