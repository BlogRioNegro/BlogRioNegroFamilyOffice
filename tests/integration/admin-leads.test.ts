import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { adminClient, serviceClient, type Client } from './support/clients'
import { localSupabase } from './support/local-supabase'

// ADM-013 · Leads com a sessão do admin e o banco local: lista geral com lead de artigo
// excluído, CSV do route handler e exclusão de lead.

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', localSupabase.API_URL)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', localSupabase.ANON_KEY)
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
vi.stubEnv('ADMIN_SITE_URL', 'http://localhost:3001')

const session: { supabase: Client | null } = { supabase: null }
vi.mock('../../apps/admin/lib/services/require-admin', () => ({
  requireAdmin: async () => ({ ok: true, supabase: session.supabase, userId: 'admin' }),
}))

const { deleteLead } = await import('../../apps/admin/app/leads/actions')
const { GET } = await import('../../apps/admin/app/leads/exportar/route')
const { listLeads } = await import('../../apps/admin/lib/services/leads')

const DELETED_TITLE = 'Artigo excluído com leads'

describe('ADM-013 · leads (admin)', () => {
  let service: Client
  const leadIds: string[] = []

  function lead(name: string) {
    return {
      article_id: null,
      article_title_snapshot: DELETED_TITLE,
      name,
      email: `lead-${randomUUID()}@example.com`,
      phone: '+5511912345678',
      consent_at: new Date().toISOString(),
      policy_version: 'v1',
      ip_hash: 'hash',
    }
  }

  beforeAll(async () => {
    service = serviceClient()
    session.supabase = await adminClient()
    const { data, error } = await service
      .from('leads')
      .insert([lead('=Fórmula maliciosa'), lead('Lead a excluir')])
      .select('id')
    if (error) throw error
    leadIds.push(...data.map((row) => row.id))
  })

  afterAll(async () => {
    await service.from('leads').delete().in('id', leadIds)
    vi.unstubAllEnvs()
  })

  it('a lista geral inclui o lead de artigo excluído, com o título original', async () => {
    const { leads, total } = await listLeads(await adminClient(), null, 1)

    expect(total).toBeGreaterThanOrEqual(2)
    expect(leads.map((row) => row.id)).toEqual(expect.arrayContaining(leadIds))
    expect(leads.find((row) => row.id === leadIds[0])?.article_title_snapshot).toBe(DELETED_TITLE)
  })

  it('o CSV traz o lead escapado, com acentos e BOM', async () => {
    const response = await GET(new Request('http://localhost/leads/exportar'))
    const bytes = new Uint8Array(await response.arrayBuffer())
    const csv = new TextDecoder().decode(bytes)

    expect(response.status).toBe(200)
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    expect(csv).toContain(`;${DELETED_TITLE};'=Fórmula maliciosa;`)
  })

  it('exclui o lead', async () => {
    const id = leadIds[1] ?? ''

    expect(await deleteLead(id)).toEqual({ ok: true, data: null })
    const { data } = await service.from('leads').select('id').eq('id', id)
    expect(data).toEqual([])
  })
})
