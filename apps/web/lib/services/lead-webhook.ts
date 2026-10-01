import 'server-only'
import { hashIdentifier } from '../domain/identifier-hash'
import { env } from '../env'
import { logger } from './logger'
import { createServiceRoleClient } from './supabase-service-role'

// LEAD-012 · Webhook do lead para o CRM (ADR 0015), enviado em segundo plano pelo `after()`.
// Este arquivo é copiado para o apps/admin na F6-012 (ADR 0032); o vetor fixo de
// `tests/fixtures/lead-webhook-signature.json` garante a mesma assinatura nos dois apps.

export const WEBHOOK_TIMEOUT_MS = 5_000
const LAST_ERROR_MAX_LENGTH = 500

export type WebhookConfig = { url: string; secret: string; timeoutMs?: number }

export type LeadWebhookPayload = {
  event: 'lead.created'
  lead: {
    id: string
    name: string
    email: string
    phone: string
    marketing_opt_in: boolean
    created_at: string
  }
  article: { id: string; title: string }
}

/** Configuração do env, ou null quando o webhook está desligado (sem LEAD_WEBHOOK_URL). */
export function webhookConfigFromEnv(): WebhookConfig | null {
  if (!env.LEAD_WEBHOOK_URL || !env.LEAD_WEBHOOK_SECRET) return null
  return { url: env.LEAD_WEBHOOK_URL, secret: env.LEAD_WEBHOOK_SECRET }
}

/** `sha256=<HMAC-SHA256(secret, timestamp + "." + body)>` em hexadecimal. */
export async function signWebhook(secret: string, timestamp: string, body: string) {
  return `sha256=${await hashIdentifier(`${timestamp}.${body}`, secret)}`
}

/** Faz o POST e devolve a descrição da falha, ou null se o destino respondeu 2xx. */
async function post(config: WebhookConfig, body: string): Promise<string | null> {
  const timestamp = String(Math.floor(Date.now() / 1000))
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RioNegro-Timestamp': timestamp,
        'X-RioNegro-Signature': await signWebhook(config.secret, timestamp, body),
      },
      body,
      signal: AbortSignal.timeout(config.timeoutMs ?? WEBHOOK_TIMEOUT_MS),
      cache: 'no-store',
    })
    return response.ok ? null : `HTTP ${response.status}`
  } catch (error) {
    return error instanceof Error ? `${error.name}: ${error.message}` : 'Falha desconhecida'
  }
}

/**
 * Envia o lead e grava o resultado: 2xx → `sent`; erro, timeout ou não 2xx → `failed` com
 * `webhook_last_error`. `webhook_attempts` passa a `attempts + 1`. Nunca lança.
 */
export async function sendLeadWebhook(
  payload: LeadWebhookPayload,
  attempts: number,
  config: WebhookConfig,
): Promise<void> {
  const leadId = payload.lead.id
  const failure = await post(config, JSON.stringify(payload))
  if (failure) logger.warn('lead.webhook_failed', { leadId, error: failure })

  const { error } = await createServiceRoleClient()
    .from('leads')
    .update({
      webhook_status: failure ? 'failed' : 'sent',
      webhook_attempts: attempts + 1,
      webhook_last_error: failure?.slice(0, LAST_ERROR_MAX_LENGTH) ?? null,
    })
    .eq('id', leadId)
  if (error) logger.error('lead.webhook_status_failed', { leadId, code: error.code })
}
