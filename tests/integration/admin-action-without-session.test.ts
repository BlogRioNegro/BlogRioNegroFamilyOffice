import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { adminClient, serviceClient, type Client } from './support/clients'
import { localSupabase } from './support/local-supabase'

// SEC-005 · Uma Server Action do admin chamada sem cookie de sessão devolve erro de
// autorização e não altera dados. A action abaixo existe só neste teste e segue o contrato
// das actions reais: requireAdmin() na primeira linha, resultado tipado.

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', localSupabase.API_URL)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', localSupabase.ANON_KEY)
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
vi.stubEnv('ADMIN_SITE_URL', 'http://localhost:3001')

const { requireAdmin, UNAUTHORIZED_MESSAGE } =
  await import('../../apps/admin/lib/services/require-admin')

async function markLeadWebhookAsSent(leadId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const { error } = await auth.supabase
    .from('leads')
    .update({ webhook_status: 'sent' })
    .eq('id', leadId)
  if (error) throw error
  return { ok: true as const, data: null }
}

describe('SEC-005 · Server Action do admin sem sessão', () => {
  let service: Client
  let leadId: string

  beforeAll(async () => {
    service = serviceClient()
    const { data, error } = await service
      .from('leads')
      .insert({
        article_title_snapshot: 'Artigo de teste',
        name: 'Pessoa Teste',
        email: `lead-${randomUUID()}@example.com`,
        phone: '+5511912345678',
        consent_at: new Date().toISOString(),
        policy_version: 'v1',
        ip_hash: 'hash',
      })
      .select('id')
      .single()
    if (error) throw error
    leadId = data.id
  })

  afterAll(async () => {
    await service.from('leads').delete().eq('id', leadId)
    vi.unstubAllEnvs()
  })

  async function webhookStatus() {
    const { data } = await service.from('leads').select('webhook_status').eq('id', leadId).single()
    return data?.webhook_status
  }

  it('devolve erro de autorização e não altera o lead', async () => {
    const result = await markLeadWebhookAsSent(leadId)

    expect(result).toEqual({ ok: false, error: UNAUTHORIZED_MESSAGE })
    expect(await webhookStatus()).toBe('disabled')
  })

  it('controle: com a sessão do admin, o mesmo update altera o lead', async () => {
    const admin = await adminClient()
    const { error } = await admin.from('leads').update({ webhook_status: 'sent' }).eq('id', leadId)

    expect(error).toBeNull()
    expect(await webhookStatus()).toBe('sent')
  })
})
