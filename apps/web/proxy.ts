import { NextResponse, type NextRequest } from 'next/server'
import { env } from './lib/env'
import { findCurrentSlug } from './lib/services/articles'

const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com'

function contentSecurityPolicy(nonce: string): string {
  const supabase = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin
  const isDev = process.env.NODE_ENV === 'development'
  // Prévia pdf embutida em <object> (PUB-007): o Chrome aplica frame-src, o Firefox object-src.
  const pdfPreviews = `${supabase}/storage/v1/object/public/article-previews/`

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${TURNSTILE_ORIGIN}${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data: ${supabase}`,
    "font-src 'self'",
    `connect-src 'self' ${supabase}`,
    `frame-src ${TURNSTILE_ORIGIN} ${pdfPreviews}`,
    `object-src ${pdfPreviews}`,
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}

const ARTICLE_PATH = /^\/artigos\/([a-z0-9]+(?:-[a-z0-9]+)*)$/

// PUB-008 · Slug antigo responde 301 para o atual (ADR 0006). Fica no proxy porque a página só
// consegue responder 307/308. Se a consulta falhar (já logada), a página decide entre 404 e erro.
async function redirectOldSlug(request: NextRequest): Promise<NextResponse | null> {
  const slug = ARTICLE_PATH.exec(request.nextUrl.pathname)?.[1]
  if (!slug) return null

  const currentSlug = await findCurrentSlug(slug).catch(() => null)
  if (!currentSlug) return null

  const url = request.nextUrl.clone()
  url.pathname = `/artigos/${currentSlug}`
  return NextResponse.redirect(url, 301)
}

export async function proxy(request: NextRequest) {
  const redirect = await redirectOldSlug(request)
  if (redirect) return redirect

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = contentSecurityPolicy(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
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
