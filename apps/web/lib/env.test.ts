import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const SECRET_32 = 'x'.repeat(32)

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'turnstile-site-key',
  TURNSTILE_SECRET_KEY: 'turnstile-secret-key',
  LEAD_HASH_SECRET: SECRET_32,
  NEXT_PUBLIC_RIO_NEGRO_URL: 'https://rionegro.example',
}

async function loadEnv() {
  const { env } = await import('./env')
  return env
}

describe('env do apps/web', () => {
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

    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe('service-role-key')
    expect(env.LEAD_WEBHOOK_URL).toBeUndefined()
  })

  it('falha nomeando a variável obrigatória ausente', async () => {
    vi.stubEnv('LEAD_HASH_SECRET', undefined)

    await expect(loadEnv()).rejects.toThrow('LEAD_HASH_SECRET')
  })

  it('trata valor vazio como ausente', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')

    await expect(loadEnv()).rejects.toThrow('TURNSTILE_SECRET_KEY')
  })

  it('rejeita URL inválida', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'nao-e-url')

    await expect(loadEnv()).rejects.toThrow('NEXT_PUBLIC_SUPABASE_URL')
  })

  it('não inclui o valor da variável na mensagem de erro', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'segredo-mal-colado')

    await expect(loadEnv()).rejects.not.toThrow('segredo-mal-colado')
  })

  it('aceita as variáveis opcionais do webhook', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', 'https://crm.example/webhook')
    vi.stubEnv('LEAD_WEBHOOK_SECRET', SECRET_32)

    const env = await loadEnv()

    expect(env.LEAD_WEBHOOK_URL).toBe('https://crm.example/webhook')
  })

  it('rejeita LEAD_HASH_SECRET com menos de 32 caracteres', async () => {
    vi.stubEnv('LEAD_HASH_SECRET', 'x'.repeat(31))

    await expect(loadEnv()).rejects.toThrow('LEAD_HASH_SECRET')
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
