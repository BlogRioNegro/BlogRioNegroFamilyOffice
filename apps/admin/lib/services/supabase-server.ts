import 'server-only'
import type { Database } from '@rio-negro/db'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '../env'
import { SESSION_COOKIE_OPTIONS } from './supabase-cookies'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: SESSION_COOKIE_OPTIONS,
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options)
        },
      },
    },
  )
}
