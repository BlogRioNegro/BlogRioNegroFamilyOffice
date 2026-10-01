import { NextRequest } from 'next/server'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import nextConfig from './next.config'

const MAIN_ROUTES = ['/', '/login']

async function loadProxy() {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://projeto.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://blog.example')
  vi.stubEnv('ADMIN_SITE_URL', 'https://admin.example')
  return import('./proxy')
}

function cspOf(response: Response): string {
  return response.headers.get('Content-Security-Policy') ?? ''
}

function nonceOf(csp: string): string | undefined {
  return csp.match(/'nonce-([^']+)'/)?.[1]
}

describe('proxy do apps/admin', () => {
  let proxyModule: Awaited<ReturnType<typeof loadProxy>>

  beforeAll(async () => {
    proxyModule = await loadProxy()
  })

  function request(path: string) {
    return proxyModule.proxy(new NextRequest(`https://admin.example${path}`))
  }

  it.each(MAIN_ROUTES)('roda o proxy em %s', (url) => {
    expect(unstable_doesMiddlewareMatch({ config: proxyModule.config, nextConfig, url })).toBe(true)
  })

  it('não roda o proxy nos assets estáticos', () => {
    const url = '/_next/static/chunks/main.js'

    expect(unstable_doesMiddlewareMatch({ config: proxyModule.config, nextConfig, url })).toBe(
      false,
    )
  })

  it('envia a CSP com nonce, strict-dynamic, Supabase e Turnstile', async () => {
    const csp = cspOf(await request('/'))

    expect(csp).toMatch(
      /script-src 'self' 'nonce-[^']+' 'strict-dynamic' https:\/\/challenges\.cloudflare\.com/,
    )
    expect(csp).not.toContain("'unsafe-inline'")
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain('frame-src https://challenges.cloudflare.com')
    expect(csp).toContain("connect-src 'self' https://projeto.supabase.co")
    expect(csp).toContain("img-src 'self' blob: data: https://projeto.supabase.co")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
  })

  it('gera um nonce diferente a cada request', async () => {
    const responses = await Promise.all(
      MAIN_ROUTES.flatMap((path) => [request(path), request(path)]),
    )
    const nonces = responses.map((response) => nonceOf(cspOf(response)))

    expect(nonces.every(Boolean)).toBe(true)
    expect(new Set(nonces).size).toBe(nonces.length)
  })

  it('repassa a mesma CSP ao render para o Next aplicar o nonce nos scripts', async () => {
    const response = await request('/login')

    expect(response.headers.get('x-middleware-request-content-security-policy')).toBe(
      cspOf(response),
    )
    expect(response.headers.get('x-middleware-request-x-nonce')).toBe(nonceOf(cspOf(response)))
  })

  it.each(['/', '/artigos', '/leads'])(
    'redireciona %s sem sessão para /login, com CSP',
    async (path) => {
      const response = await request(path)

      expect(response.status).toBe(307)
      expect(new URL(response.headers.get('location') ?? '').pathname).toBe('/login')
      expect(nonceOf(cspOf(response))).toBeTruthy()
    },
  )

  it('deixa /login abrir sem sessão', async () => {
    const response = await request('/login')

    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})

describe('headers fixos do apps/admin', () => {
  it('aplica nosniff, Referrer-Policy, Permissions-Policy e noindex em todas as rotas', async () => {
    const rules = (await nextConfig.headers?.()) ?? []

    expect(rules).toEqual([
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
          },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
    ])
  })

  it('não envia X-Powered-By (SEC-3)', () => {
    expect(nextConfig.poweredByHeader).toBe(false)
  })
})
