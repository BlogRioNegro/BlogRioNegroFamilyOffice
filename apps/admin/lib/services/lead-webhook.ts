import 'server-only'
import { hashIdentifier } from '../domain/identifier-hash'
import { env } from '../env'
import { logger } from './logger'
import type { AdminContext } from './require-admin'

// ADM-014 · Cópia de `apps/web/lib/services/lead-webhook.ts` (ADR 0021, ADR 0032): mesmo payload,
// mesma assinatura e mesmo timeout. O vetor fixo `tests/fixtures/lead-webhook-signature.json`
// quebra o teste da cópia que ficar para trás. Diferenças: o status é gravado com a sessão do
// admin (RLS; o admin não tem service role) e o artigo pode ter sido excluído (ADR 0039).

type Supabase = AdminContext['supabase']

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
  article: { id: string | null; title: string }
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
 * `webhook_last_error`. `webhook_attempts` passa a `attempts + 1`. Nunca lança; devolve se enviou.
 */
export async function sendLeadWebhook(
  supabase: Supabase,
  payload: LeadWebhookPayload,
  attempts: number,
  config: WebhookConfig,
): Promise<boolean> {
  const leadId = payload.lead.id
  const failure = await post(config, JSON.stringify(payload))
  if (failure) logger.warn('lead.webhook_failed', { leadId, error: failure })

  const { error } = await supabase
    .from('leads')
    .update({
      webhook_status: failure ? 'failed' : 'sent',
      webhook_attempts: attempts + 1,
      webhook_last_error: failure?.slice(0, LAST_ERROR_MAX_LENGTH) ?? null,
    })
    .eq('id', leadId)
  if (error) logger.error('lead.webhook_status_failed', { leadId, code: error.code })
  return failure === null
}

export type ResendSummary = { sent: number; failed: number }

/** ADM-014 · Reenvia, um a um, os leads `failed` (do artigo ou de todos). */
export async function resendFailedLeads(
  supabase: Supabase,
  articleId: string | null,
  config: WebhookConfig,
): Promise<ResendSummary | null> {
  const query = supabase
    .from('leads')
    .select(
      'id, name, email, phone, marketing_opt_in, created_at, article_id, article_title_snapshot, webhook_attempts',
    )
    .eq('webhook_status', 'failed')
    .order('created_at', { ascending: true })
  const { data, error } = await (articleId ? query.eq('article_id', articleId) : query)
  if (error) {
    logger.error('admin.webhook_failed_list_failed', { code: error.code })
    return null
  }

  const summary: ResendSummary = { sent: 0, failed: 0 }
  for (const lead of data) {
    const payload: LeadWebhookPayload = {
      event: 'lead.created',
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        marketing_opt_in: lead.marketing_opt_in,
        created_at: lead.created_at,
      },
      article: { id: lead.article_id, title: lead.article_title_snapshot },
    }
    const sent = await sendLeadWebhook(supabase, payload, lead.webhook_attempts, config)
    summary[sent ? 'sent' : 'failed'] += 1
  }
  return summary
}

/** Nº de leads `failed` (do artigo ou de todos), para o rótulo "Reenviar falhas (<n>)". */
export async function countFailedLeads(supabase: Supabase, articleId: string | null) {
  const query = supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('webhook_status', 'failed')
  const { count, error } = await (articleId ? query.eq('article_id', articleId) : query)
  if (error) {
    logger.error('admin.webhook_failed_count_failed', { code: error.code })
    throw new Error('Falha ao contar leads com falha')
  }
  return count ?? 0
}
