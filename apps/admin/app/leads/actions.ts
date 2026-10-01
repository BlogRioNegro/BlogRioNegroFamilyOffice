'use server'

import { z } from 'zod'
import {
  failAction,
  GENERIC_ERROR_MESSAGE,
  type ActionResult,
} from '../../lib/services/action-result'
import { deleteLeadRecord } from '../../lib/services/leads'
import {
  resendFailedLeads,
  webhookConfigFromEnv,
  type ResendSummary,
} from '../../lib/services/lead-webhook'
import { requireAdmin } from '../../lib/services/require-admin'

export type DeleteLeadResult = ActionResult<null>

/** ADM-013 · Exclui um lead (pedido do titular, LGPD). */
export async function deleteLead(leadId: string): Promise<DeleteLeadResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const id = z.uuid().safeParse(leadId)
  if (!id.success) return { ok: false, error: GENERIC_ERROR_MESSAGE }

  const deleteError = await deleteLeadRecord(auth.supabase, id.data)
  if (deleteError) return failAction('admin.lead_delete_failed', deleteError)
  return { ok: true, data: null }
}

const WEBHOOK_DISABLED_MESSAGE =
  'O reenvio está desligado: defina LEAD_WEBHOOK_URL e LEAD_WEBHOOK_SECRET no ambiente do painel.'

export type ResendResult = ActionResult<ResendSummary>

/** ADM-014 · Reenvia os leads `failed` (do artigo, ou de todos com `null`) ao CRM. */
export async function resendWebhookFailures(articleId: string | null): Promise<ResendResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const id = z.uuid().nullable().safeParse(articleId)
  if (!id.success) return { ok: false, error: GENERIC_ERROR_MESSAGE }

  const config = webhookConfigFromEnv()
  if (!config) return { ok: false, error: WEBHOOK_DISABLED_MESSAGE }

  const summary = await resendFailedLeads(auth.supabase, id.data, config)
  if (!summary) return { ok: false, error: GENERIC_ERROR_MESSAGE }
  return { ok: true, data: summary }
}
