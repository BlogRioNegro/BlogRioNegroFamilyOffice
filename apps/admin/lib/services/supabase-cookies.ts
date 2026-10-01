import type { CookieOptionsWithName } from '@supabase/ssr'

// A sessão do admin fica só em cookie httpOnly (ADM-001); o browser nunca lê o token.
export const SESSION_COOKIE_OPTIONS: CookieOptionsWithName = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}
