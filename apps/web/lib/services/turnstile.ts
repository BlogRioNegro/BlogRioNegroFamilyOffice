import 'server-only'
import { z } from 'zod'
import { env } from '../env'
import { logger } from './logger'

// LEAD-005 · Verificação do token no server (siteverify) antes de qualquer escrita. O IP do
// cliente não é enviado (`remoteip` é opcional). Falha de rede ou timeout conta como recusa.

export const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
export const TURNSTILE_TIMEOUT_MS = 5_000

const siteverifySchema = z.object({
  success: z.boolean(),
  'error-codes': z.array(z.string()).default([]),
})

export async function verifyTurnstile(
  token: string,
  timeoutMs: number = TURNSTILE_TIMEOUT_MS,
): Promise<boolean> {
  if (!token) return false

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    })
    const result = siteverifySchema.parse(await response.json())
    if (!result.success) logger.warn('turnstile.rejected', { codes: result['error-codes'] })
    return result.success
  } catch (error) {
    logger.error('turnstile.unavailable', { error })
    return false
  }
}
