import type { Database } from '@rio-negro/db'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from './lib/env'
import { SESSION_COOKIE_OPTIONS } from './lib/services/supabase-cookies'

const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com'
const PUBLIC_PATHS = new Set(['/login'])

function contentSecurityPolicy(nonce: string): string {
  const supabase = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin
  const isDev = process.env.NODE_ENV === 'development'

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${TURNSTILE_ORIGIN}${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data: ${supabase}`,
    "font-src 'self'",
    `connect-src 'self' ${supabase}`,
    `frame-src ${TURNSTILE_ORIGIN}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}

function forwardWithCsp(request: NextRequest, nonce: string, csp: string) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

// Renova a sessão (ADM-002) e redireciona para /login quem não tem sessão.
// A autorização de admin é revalidada em cada action por requireAdmin() (SEC-005).
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = contentSecurityPolicy(nonce)
  let response = forwardWithCsp(request, nonce, csp)

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: SESSION_COOKIE_OPTIONS,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, headers) => {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
          response = forwardWithCsp(request, nonce, csp)
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
          for (const [key, value] of Object.entries(headers)) response.headers.set(key, value)
        },
      },
    },
  )

  const { data } = await supabase.auth.getUser()
  if (data.user || PUBLIC_PATHS.has(request.nextUrl.pathname)) return response

  const redirect = NextResponse.redirect(new URL('/login', request.url))
  redirect.headers.set('Content-Security-Policy', csp)
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie)
  return redirect
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
