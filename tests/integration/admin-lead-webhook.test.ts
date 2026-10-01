import { createHmac, randomUUID } from 'node:crypto'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { adminClient, serviceClient, type Client } from './support/clients'
import { localSupabase } from './support/local-supabase'

// ADM-014 · Reenvio das falhas pela cópia do admin, com a sessão do admin (RLS) e um servidor HTTP
// local no lugar do CRM.

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', localSupabase.API_URL)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', localSupabase.ANON_KEY)
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
vi.stubEnv('ADMIN_SITE_URL', 'http://localhost:3001')

const { resendFailedLeads, countFailedLeads } =
  await import('../../apps/admin/lib/services/lead-webhook')

const SECRET = 'segredo-do-webhook-de-teste-com-32-chars'
const ARTICLE = { id: '11111111-1111-4111-8111-111111111111', title: 'Artigo do reenvio' }
const DELETED_TITLE = 'Artigo excluído do reenvio'

type Received = { headers: IncomingMessage['headers']; body: string }

describe('ADM-014 · resendFailedLeads', () => {
  let server: Server
  let url = ''
  const received: Received[] = []
  let admin: Client
  const service = serviceClient()
  const ids = { toSend: randomUUID(), toFail: randomUUID(), sent: randomUUID() }

  function lead(id: string, overrides: Record<string, unknown>) {
    return {
      id,
      article_id: ARTICLE.id,
      article_title_snapshot: ARTICLE.title,
      name: 'Maria Silva',
      email: `reenvio-${id}@exemplo.com.br`,
      phone: '+5511987654321',
      consent_at: new Date().toISOString(),
      policy_version: 'v1',
      ip_hash: 'hash-reenvio',
      webhook_status: 'failed' as const,
      webhook_attempts: 1,
      ...overrides,
    }
  }

  beforeAll(async () => {
    vi.spyOn(process.stdout, 'write').mockReturnValue(true)
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    server = createServer((request, response: ServerResponse) => {
      let body = ''
      request.on('data', (chunk: Buffer) => (body += chunk.toString()))
      request.on('end', () => {
        received.push({ headers: request.headers, body })
        const payload = JSON.parse(body)
        response.writeHead(payload.article.id === null ? 500 : 204).end()
      })
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('sem porta TCP')
    url = `http://127.0.0.1:${address.port}`

    admin = await adminClient()
    const { error } = await service.from('leads').insert([
      lead(ids.toSend, { created_at: '2026-09-20T12:00:00Z' }),
      lead(ids.toFail, {
        article_id: null,
        article_title_snapshot: DELETED_TITLE,
        created_at: '2026-09-21T12:00:00Z',
      }),
      lead(ids.sent, { webhook_status: 'sent', created_at: '2026-09-22T12:00:00Z' }),
    ])
    if (error) throw error
  })

  afterAll(async () => {
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
    await service.from('leads').delete().eq('ip_hash', 'hash-reenvio')
    vi.unstubAllEnvs()
  })

  it('conta só os `failed` do filtro', async () => {
    expect(await countFailedLeads(admin, ARTICLE.id)).toBe(1)
    expect(await countFailedLeads(admin, null)).toBeGreaterThanOrEqual(2)
  })

  it('reenvia os `failed`, conta enviados e falhas e atualiza status e tentativas', async () => {
    const summary = await resendFailedLeads(admin, null, { url, secret: SECRET })

    expect(summary?.sent).toBeGreaterThanOrEqual(1)
    expect(summary?.failed).toBeGreaterThanOrEqual(1)
    const { data } = await service
      .from('leads')
      .select('id, webhook_status, webhook_attempts, webhook_last_error')
      .in('id', Object.values(ids))
    const byId = Object.fromEntries((data ?? []).map((row) => [row.id, row]))
    expect(byId[ids.toSend]).toMatchObject({
      webhook_status: 'sent',
      webhook_attempts: 2,
      webhook_last_error: null,
    })
    expect(byId[ids.toFail]).toMatchObject({
      webhook_status: 'failed',
      webhook_attempts: 2,
      webhook_last_error: 'HTTP 500',
    })
    expect(byId[ids.sent]).toMatchObject({ webhook_status: 'sent', webhook_attempts: 1 })
  })

  it('usa o payload e a assinatura da LEAD-012; artigo excluído vai com id null', async () => {
    const mine = received.map((request) => ({ ...request, json: JSON.parse(request.body) }))
    const sent = mine.find((request) => request.json.lead.id === ids.toSend)
    const deleted = mine.find((request) => request.json.lead.id === ids.toFail)

    expect(sent?.json).toEqual({
      event: 'lead.created',
      lead: {
        id: ids.toSend,
        name: 'Maria Silva',
        email: `reenvio-${ids.toSend}@exemplo.com.br`,
        phone: '+5511987654321',
        marketing_opt_in: false,
        created_at: '2026-09-20T12:00:00+00:00',
      },
      article: ARTICLE,
    })
    const timestamp = String(sent?.headers['x-rionegro-timestamp'])
    const expected = createHmac('sha256', SECRET).update(`${timestamp}.${sent?.body}`).digest('hex')
    expect(sent?.headers['x-rionegro-signature']).toBe(`sha256=${expected}`)
    expect(deleted?.json.article).toEqual({ id: null, title: DELETED_TITLE })
  })
})
