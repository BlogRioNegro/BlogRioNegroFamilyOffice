import 'server-only'
import type { Database } from '@rio-negro/db'
import { hashIdentifier } from '../domain/identifier-hash'
import { POLICY_VERSION, SIGNED_URL_SECONDS, type Lead } from '../domain/lead'
import { env } from '../env'
import { createServiceRoleClient } from './supabase-service-role'

// LEAD-008 · LEAD-009 · Escrita do lead e entrega do PDF completo, só com a service role (SEC-002).
// Erros do PostgREST trazem em `details` a linha recusada, com dados pessoais: daqui só saem
// `code` e `message`.

type WebhookStatus = Database['public']['Enums']['webhook_status']

function dbError(operation: string, error: { code: string; message: string }): Error {
  return new Error(`${operation}: ${error.code} ${error.message}`)
}

export type CreatedLead = { id: string; created_at: string }

/** LEAD-008 · Um registro por download (ADR 0019), com consentimento, versão do aviso e ip_hash. */
export async function insertLead(input: {
  lead: Lead
  article: { id: string; title: string }
  ip: string
  webhookStatus: WebhookStatus
}): Promise<CreatedLead> {
  const { lead, article } = input
  const { data, error } = await createServiceRoleClient()
    .from('leads')
    .insert({
      article_id: article.id,
      article_title_snapshot: article.title,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      consent_at: new Date().toISOString(),
      policy_version: POLICY_VERSION,
      marketing_opt_in: lead.marketingOptIn,
      ip_hash: await hashIdentifier(input.ip, env.LEAD_HASH_SECRET),
      webhook_status: input.webhookStatus,
    })
    .select('id, created_at')
    .single()

  if (error) throw dbError('insert do lead', error)
  return data
}

/** LEAD-009 · URL assinada de 60 s do PDF completo; chamar só depois do insert confirmado. */
export async function createDownloadUrl(articleId: string): Promise<string> {
  const client = createServiceRoleClient()
  const { data: content, error } = await client
    .from('article_contents')
    .select('full_pdf_path')
    .eq('article_id', articleId)
    .single()
  if (error) throw dbError('leitura do PDF completo', error)

  const { data: signed, error: signError } = await client.storage
    .from('article-files')
    .createSignedUrl(content.full_pdf_path, SIGNED_URL_SECONDS, { download: true })
  if (signError) throw new Error(`URL assinada: ${signError.message}`)
  return signed.signedUrl
}
