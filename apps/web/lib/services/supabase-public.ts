import 'server-only'
import type { Database } from '@rio-negro/db'
import { createClient } from '@supabase/supabase-js'
import { env } from '../env'

// Leitura pública sob RLS (anon key). Sem cache de dados: cada request consulta o banco (ADR 0003).
export function createPublicClient() {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  })
}
