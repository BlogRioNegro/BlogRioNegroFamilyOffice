import 'server-only'
import { LEAD_ERROR_MESSAGE, leadSchema, type Lead } from '../domain/lead'
import { failAction, type ActionResult } from './action-result'
import { findArticleForLead } from './articles'
import { webhookConfigFromEnv, sendLeadWebhook, type LeadWebhookPayload } from './lead-webhook'
import { createDownloadUrl, insertLead, type CreatedLead } from './leads'
import { logger } from './logger'
import { consumeLeadRateLimits, RATE_LIMIT_MESSAGE } from './rate-limit'
import { verifyTurnstile } from './turnstile'

// LEAD-007 · Pedido de download do artigo completo, na ordem obrigatória:
// (1) Zod → (2) Turnstile → (3) rate limit IP e e-mail → (4) artigo existe → (5) insert do lead
// → (6) URL assinada → (7) agendar webhook. Nenhuma URL é gerada se algo falhar até (5).
// Nada de dado pessoal nos logs: só eventos, campos inválidos e erros sem a linha do banco.

export type DownloadContext = {
  /** IP do cliente (`clientIp`); só entra em hash. */
  ip: string
  /** Roda a tarefa depois da resposta (o `after` do Next). */
  schedule: (task: () => Promise<void>) => void
}

export type DownloadResult = ActionResult<{ url: string }>

function webhookPayload(
  lead: Lead,
  created: CreatedLead,
  article: { id: string; title: string },
): LeadWebhookPayload {
  return {
    event: 'lead.created',
    lead: {
      id: created.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      marketing_opt_in: lead.marketingOptIn,
      created_at: created.created_at,
    },
    article: { id: article.id, title: article.title },
  }
}

function fail(event: string, error: unknown): DownloadResult {
  return failAction(event, error, LEAD_ERROR_MESSAGE)
}

export async function handleDownloadRequest(
  input: unknown,
  context: DownloadContext,
): Promise<DownloadResult> {
  const parsed = leadSchema.safeParse(input)
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join('.'))
    return fail('lead.invalid_input', { fields })
  }
  const lead = parsed.data

  try {
    if (!(await verifyTurnstile(lead.turnstileToken))) {
      return fail('lead.turnstile_rejected', null)
    }

    if (!(await consumeLeadRateLimits({ ip: context.ip, email: lead.email }))) {
      logger.warn('lead.rate_limited')
      return { ok: false, error: RATE_LIMIT_MESSAGE }
    }

    const article = await findArticleForLead(lead.articleId)
    if (!article) return fail('lead.article_not_found', { articleId: lead.articleId })

    const webhook = webhookConfigFromEnv()
    const created = await insertLead({
      lead,
      article,
      ip: context.ip,
      webhookStatus: webhook ? 'pending' : 'disabled',
    })

    const download = await createDownloadUrl(article.id).then(
      (url) => ({ ok: true as const, url }),
      (error: unknown) => ({ ok: false as const, error }),
    )

    // ADR 0032: com o lead gravado, o webhook é agendado mesmo se a URL falhou; assim nenhum
    // lead fica `pending` para sempre. O `after()` roda depois da resposta: o download não espera.
    if (webhook) {
      const payload = webhookPayload(lead, created, article)
      context.schedule(() => sendLeadWebhook(payload, 0, webhook))
    }

    if (!download.ok) {
      return fail('lead.signed_url_failed', { leadId: created.id, error: download.error })
    }
    return { ok: true, data: { url: download.url } }
  } catch (error) {
    return fail('lead.request_failed', error)
  }
}
