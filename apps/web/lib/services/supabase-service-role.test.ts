import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

describe('createServiceRoleClient', () => {
  it('é um módulo server-only', () => {
    const source = readFileSync(new URL('./supabase-service-role.ts', import.meta.url), 'utf8')

    expect(source.startsWith("import 'server-only'\n")).toBe(true)
  })

  it('cria o client com a URL e a service role do env', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'turnstile-site-key')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'turnstile-secret-key')
    vi.stubEnv('LEAD_HASH_SECRET', 'x'.repeat(32))
    vi.stubEnv('NEXT_PUBLIC_RIO_NEGRO_URL', 'https://rionegro.example')

    const { createServiceRoleClient } = await import('./supabase-service-role')
    const client = createServiceRoleClient()

    expect(client.storage.from('article-files')).toBeDefined()
    vi.unstubAllEnvs()
  })
})
