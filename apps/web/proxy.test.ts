import { NextRequest } from 'next/server'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import nextConfig from './next.config'

const MAIN_ROUTES = ['/', '/artigos/exemplo']

vi.mock('./lib/services/articles', () => ({
  findCurrentSlug: vi.fn(async (slug: string) => (slug === 'slug-antigo' ? 'slug-atual' : null)),
}))

async function loadProxy() {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://projeto.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://blog.example')
  vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'turnstile-site-key')
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'turnstile-secret-key')
  vi.stubEnv('LEAD_HASH_SECRET', 'x'.repeat(32))
  vi.stubEnv('NEXT_PUBLIC_RIO_NEGRO_URL', 'https://rionegro.example')
  return import('./proxy')
}

function cspOf(response: Response): string {
  return response.headers.get('Content-Security-Policy') ?? ''
}

function nonceOf(csp: string): string | undefined {
  return csp.match(/'nonce-([^']+)'/)?.[1]
}

describe('proxy do apps/web', () => {
  let proxyModule: Awaited<ReturnType<typeof loadProxy>>

  beforeAll(async () => {
    proxyModule = await loadProxy()
  })

  async function request(path: string) {
    return proxyModule.proxy(new NextRequest(`https://blog.example${path}`))
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
    expect(csp).toContain(
      'frame-src https://challenges.cloudflare.com https://projeto.supabase.co/storage/v1/object/public/article-previews/;',
    )
    expect(csp).toContain("connect-src 'self' https://projeto.supabase.co")
    expect(csp).toContain("img-src 'self' blob: data: https://projeto.supabase.co")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain(
      'object-src https://projeto.supabase.co/storage/v1/object/public/article-previews/;',
    )
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
    const response = await request('/')

    expect(response.headers.get('x-middleware-request-content-security-policy')).toBe(
      cspOf(response),
    )
    expect(response.headers.get('x-middleware-request-x-nonce')).toBe(nonceOf(cspOf(response)))
  })
})

describe('PUB-008 · redirect de slug antigo no proxy', () => {
  let proxyModule: Awaited<ReturnType<typeof loadProxy>>

  beforeAll(async () => {
    proxyModule = await loadProxy()
  })

  it('responde 301 para o slug atual, mantendo a query', async () => {
    const response = await proxyModule.proxy(
      new NextRequest('https://blog.example/artigos/slug-antigo?utm_source=whatsapp'),
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://blog.example/artigos/slug-atual?utm_source=whatsapp',
    )
  })

  it.each(['/artigos/slug-atual', '/artigos/nao-existe', '/artigos', '/slug-antigo'])(
    'segue para a página em %s',
    async (path) => {
      const response = await proxyModule.proxy(new NextRequest(`https://blog.example${path}`))

      expect(response.status).toBe(200)
      expect(cspOf(response)).toContain('nonce-')
    },
  )
})

describe('headers fixos do apps/web', () => {
  it('aplica nosniff, Referrer-Policy e Permissions-Policy em todas as rotas', async () => {
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
        ],
      },
    ])
  })

  it('não envia X-Powered-By (SEC-3)', () => {
    expect(nextConfig.poweredByHeader).toBe(false)
  })
})
