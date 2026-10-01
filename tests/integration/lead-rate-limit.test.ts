import { randomUUID } from 'node:crypto'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { executeLocalSql, queryLocalDb } from './support/local-supabase'
import { stubWebEnv } from './support/web-env'

// LEAD-006 · Rate limit por IP (20/10 min) e por e-mail (3/10 min) em consume_rate_limit.

stubWebEnv()

const { consumeLeadRateLimits, rateLimitKey } =
  await import('../../apps/web/lib/services/rate-limit')

afterAll(() => {
  vi.unstubAllEnvs()
})

const uniqueIp = () => `203.0.113.${Math.floor(Math.random() * 250)}-${randomUUID()}`
const uniqueEmail = () => `lead-${randomUUID()}@exemplo.com.br`

/** Simula a virada da janela: move as linhas da chave para a janela anterior. */
function moveToPreviousWindow(key: string) {
  executeLocalSql(`update public.lead_rate_limits
    set window_start = window_start - interval '10 minutes' where key = '${key}'`)
}

describe('consumeLeadRateLimits', () => {
  it('bloqueia o 21º envio do mesmo IP e volta a aceitar na janela seguinte', async () => {
    const ip = uniqueIp()

    for (let attempt = 1; attempt <= 20; attempt++) {
      expect(await consumeLeadRateLimits({ ip, email: uniqueEmail() })).toBe(true)
    }
    expect(await consumeLeadRateLimits({ ip, email: uniqueEmail() })).toBe(false)

    moveToPreviousWindow(await rateLimitKey('ip', ip))
    expect(await consumeLeadRateLimits({ ip, email: uniqueEmail() })).toBe(true)
  })

  it('bloqueia o 4º envio do mesmo e-mail e volta a aceitar na janela seguinte', async () => {
    const email = uniqueEmail()

    for (let attempt = 1; attempt <= 3; attempt++) {
      expect(await consumeLeadRateLimits({ ip: uniqueIp(), email })).toBe(true)
    }
    expect(await consumeLeadRateLimits({ ip: uniqueIp(), email })).toBe(false)

    moveToPreviousWindow(await rateLimitKey('email', email))
    expect(await consumeLeadRateLimits({ ip: uniqueIp(), email })).toBe(true)
  })

  it('grava só chaves em HMAC, nunca o IP ou o e-mail em claro', async () => {
    const ip = uniqueIp()
    const email = uniqueEmail()

    await consumeLeadRateLimits({ ip, email })

    const keys = queryLocalDb(
      `select key from public.lead_rate_limits where key in ('${await rateLimitKey('ip', ip)}', '${await rateLimitKey('email', email)}')`,
    ).map((row) => String(row.key))
    expect(keys).toHaveLength(2)
    for (const key of keys) {
      expect(key).toMatch(/^(ip|email):[0-9a-f]{64}$/)
      expect(key).not.toContain(ip)
      expect(key).not.toContain(email)
    }
  })
})
