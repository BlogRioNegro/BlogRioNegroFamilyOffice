import 'server-only'
import { hashIdentifier } from '../domain/identifier-hash'
import { env } from '../env'
import { createServiceRoleClient } from './supabase-service-role'

// LEAD-006 · Limites da spec em janela fixa de 10 min (DATA-005). Chaves em HMAC (SEC-004):
// nem o IP nem o e-mail aparecem em claro no banco.
export const RATE_LIMITS = {
  ip: { limit: 20, window: '10 minutes' },
  email: { limit: 3, window: '10 minutes' },
} as const

export const RATE_LIMIT_MESSAGE = 'Muitas tentativas, tente em alguns minutos'

type Scope = keyof typeof RATE_LIMITS

export async function rateLimitKey(scope: Scope, value: string): Promise<string> {
  return `${scope}:${await hashIdentifier(value, env.LEAD_HASH_SECRET)}`
}

async function consume(scope: Scope, value: string): Promise<boolean> {
  const { limit, window } = RATE_LIMITS[scope]
  const { data, error } = await createServiceRoleClient().rpc('consume_rate_limit', {
    key: await rateLimitKey(scope, value),
    limit,
    window,
  })
  if (error) throw new Error(`consume_rate_limit falhou (${scope}): ${error.code}`)
  return data
}

/** Conta o envio por IP e, se ainda couber, por e-mail. `false` = acima de algum limite. */
export async function consumeLeadRateLimits(identity: {
  ip: string
  email: string
}): Promise<boolean> {
  if (!(await consume('ip', identity.ip))) return false
  return consume('email', identity.email)
}
