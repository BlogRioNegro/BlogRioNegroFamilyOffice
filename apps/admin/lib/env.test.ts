import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const SECRET_32 = 'x'.repeat(32)

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  ADMIN_SITE_URL: 'http://localhost:3001',
}

async function loadEnv() {
  const { env } = await import('./env')
  return env
}

describe('env do apps/admin', () => {
  beforeEach(() => {
    vi.resetModules()
    for (const [name, value] of Object.entries(validEnv)) vi.stubEnv(name, value)
    vi.stubEnv('LEAD_WEBHOOK_URL', undefined)
    vi.stubEnv('LEAD_WEBHOOK_SECRET', undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('carrega quando todas as obrigatórias estão presentes', async () => {
    const env = await loadEnv()

    expect(env.ADMIN_SITE_URL).toBe('http://localhost:3001')
  })

  it('falha nomeando a variável obrigatória ausente', async () => {
    vi.stubEnv('ADMIN_SITE_URL', undefined)

    await expect(loadEnv()).rejects.toThrow('ADMIN_SITE_URL')
  })

  it('nunca expõe a service role, mesmo se ela existir no ambiente', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key')

    const env = await loadEnv()

    expect(env).not.toHaveProperty('SUPABASE_SERVICE_ROLE_KEY')
  })

  it('aceita o webhook com https e segredo de 32 caracteres', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', 'https://crm.example/webhook')
    vi.stubEnv('LEAD_WEBHOOK_SECRET', SECRET_32)

    const env = await loadEnv()

    expect(env.LEAD_WEBHOOK_SECRET).toBe(SECRET_32)
  })

  it('rejeita LEAD_WEBHOOK_SECRET com menos de 32 caracteres', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', 'https://crm.example/webhook')
    vi.stubEnv('LEAD_WEBHOOK_SECRET', 'x'.repeat(31))

    await expect(loadEnv()).rejects.toThrow('LEAD_WEBHOOK_SECRET')
  })

  it('exige LEAD_WEBHOOK_SECRET quando LEAD_WEBHOOK_URL está definida', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', 'https://crm.example/webhook')

    await expect(loadEnv()).rejects.toThrow('LEAD_WEBHOOK_SECRET')
  })

  it('rejeita LEAD_WEBHOOK_URL sem https', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', 'http://crm.example/webhook')
    vi.stubEnv('LEAD_WEBHOOK_SECRET', SECRET_32)

    await expect(loadEnv()).rejects.toThrow('LEAD_WEBHOOK_URL')
  })
})
