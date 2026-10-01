import { createHmac, randomUUID } from 'node:crypto'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { executeLocalSql, queryLocalDb } from './support/local-supabase'
import { stubWebEnv } from './support/web-env'

// LEAD-012 · Webhook do lead contra um servidor HTTP local, criado e encerrado neste arquivo.

const SECRET = 'segredo-do-webhook-de-teste-com-32-chars'
stubWebEnv({ LEAD_WEBHOOK_URL: 'https://crm.example/webhook', LEAD_WEBHOOK_SECRET: SECRET })

const { sendLeadWebhook } = await import('../../apps/web/lib/services/lead-webhook')
const { handleDownloadRequest } = await import('../../apps/web/lib/services/article-download')
const { LEAD_ERROR_MESSAGE } = await import('../../apps/web/lib/domain/lead')

const SEED_ARTICLE = { id: '11111111-1111-4111-8111-111111111111', title: 'Artigo do webhook' }
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const realFetch = globalThis.fetch

function urlOf(target: Server): string {
  const address = target.address()
  if (address === null || typeof address === 'string') throw new Error('servidor sem porta TCP')
  return `http://127.0.0.1:${address.port}`
}

type Received = { headers: IncomingMessage['headers']; body: string }
let respond: (response: ServerResponse) => void
let received: Received[] = []
let server: Server
let baseUrl: string

beforeAll(async () => {
  server = createServer((request, response) => {
    let body = ''
    request.on('data', (chunk: Buffer) => (body += chunk.toString()))
    request.on('end', () => {
      received.push({ headers: request.headers, body })
      respond(response)
    })
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = urlOf(server)
})

afterAll(async () => {
  server.closeAllConnections()
  await new Promise((resolve) => server.close(resolve))
  executeLocalSql(`delete from public.leads where article_title_snapshot = '${SEED_ARTICLE.title}'`)
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

beforeEach(() => {
  received = []
  respond = (response) => response.writeHead(204).end()
  vi.spyOn(process.stdout, 'write').mockReturnValue(true)
  vi.spyOn(process.stderr, 'write').mockReturnValue(true)
})

function insertPendingLead() {
  const id = randomUUID()
  executeLocalSql(`insert into public.leads (id, article_id, article_title_snapshot, name, email,
      phone, consent_at, policy_version, ip_hash, webhook_status)
    values ('${id}', '${SEED_ARTICLE.id}', '${SEED_ARTICLE.title}', 'Maria Silva',
      'webhook-${id}@exemplo.com.br', '+5511987654321', now(), 'blog-2026-09-v1', 'hash', 'pending')`)
  return id
}

function payloadOf(id: string) {
  return {
    event: 'lead.created' as const,
    lead: {
      id,
      name: 'Maria Silva',
      email: `webhook-${id}@exemplo.com.br`,
      phone: '+5511987654321',
      marketing_opt_in: false,
      created_at: '2026-09-25T12:00:00.000Z',
    },
    article: SEED_ARTICLE,
  }
}

function webhookColumns(id: string) {
  const [row] = queryLocalDb(`select webhook_status, webhook_attempts, webhook_last_error
    from public.leads where id = '${id}'`)
  return row
}

describe('sendLeadWebhook', () => {
  it('2xx: envia o payload assinado e marca `sent`', async () => {
    const id = insertPendingLead()

    await sendLeadWebhook(payloadOf(id), 0, { url: `${baseUrl}/crm`, secret: SECRET })

    expect(webhookColumns(id)).toEqual({
      webhook_status: 'sent',
      webhook_attempts: 1,
      webhook_last_error: null,
    })
    const [request] = received
    const timestamp = String(request?.headers['x-rionegro-timestamp'])
    const expected = createHmac('sha256', SECRET)
      .update(`${timestamp}.${request?.body}`)
      .digest('hex')
    expect(request?.headers['x-rionegro-signature']).toBe(`sha256=${expected}`)
    expect(request?.headers['content-type']).toBe('application/json')
    expect(JSON.parse(request?.body ?? '')).toEqual(payloadOf(id))
  })

  it('resposta não 2xx: marca `failed` com o erro e soma a tentativa', async () => {
    respond = (response) => response.writeHead(500).end()
    const id = insertPendingLead()

    await sendLeadWebhook(payloadOf(id), 2, { url: baseUrl, secret: SECRET })

    expect(webhookColumns(id)).toEqual({
      webhook_status: 'failed',
      webhook_attempts: 3,
      webhook_last_error: 'HTTP 500',
    })
  })

  it('timeout: marca `failed` sem esperar além do limite', async () => {
    respond = (response) => setTimeout(() => response.writeHead(204).end(), 2_000)
    const id = insertPendingLead()
    const started = Date.now()

    await sendLeadWebhook(payloadOf(id), 0, { url: baseUrl, secret: SECRET, timeoutMs: 200 })

    expect(Date.now() - started).toBeLessThan(1_500)
    expect(webhookColumns(id)).toMatchObject({ webhook_status: 'failed', webhook_attempts: 1 })
    expect(String(webhookColumns(id)?.webhook_last_error)).toContain('TimeoutError')
  })

  it('destino fora do ar: marca `failed`', async () => {
    const offline = createServer()
    await new Promise<void>((resolve) => offline.listen(0, '127.0.0.1', resolve))
    const url = urlOf(offline)
    await new Promise((resolve) => offline.close(resolve))
    const id = insertPendingLead()

    await sendLeadWebhook(payloadOf(id), 0, { url, secret: SECRET })

    expect(webhookColumns(id)).toMatchObject({ webhook_status: 'failed', webhook_attempts: 1 })
  })
})

describe('requestArticleDownload com o webhook ligado', () => {
  it('grava `pending` e agenda o envio mesmo com a URL falhando (ADR 0032)', async () => {
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      String(input) === SITEVERIFY
        ? Promise.resolve(Response.json({ success: true, 'error-codes': [] }))
        : realFetch(input, init),
    )
    const email = `webhook-${randomUUID()}@exemplo.com.br`
    const tasks: (() => Promise<void>)[] = []

    // O PDF completo do artigo do seed não existe no Storage: a etapa 6 falha.
    const result = await handleDownloadRequest(
      {
        articleId: SEED_ARTICLE.id,
        name: 'Maria Silva',
        email,
        phone: '(11) 98765-4321',
        consent: true,
        turnstileToken: 'token',
      },
      { ip: '198.51.100.20', schedule: (task) => tasks.push(task) },
    )

    expect(result).toEqual({ ok: false, error: LEAD_ERROR_MESSAGE })
    expect(tasks).toHaveLength(1)
    const [lead] = queryLocalDb(`select webhook_status from public.leads where email = '${email}'`)
    expect(lead?.webhook_status).toBe('pending')
    expect(received).toHaveLength(0)
    executeLocalSql(`delete from public.leads where email = '${email}'`)
  })
})
