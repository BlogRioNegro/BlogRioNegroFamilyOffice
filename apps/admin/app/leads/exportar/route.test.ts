import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LeadRow } from '../../../lib/domain/leads'

const requireAdmin = vi.fn()
const listLeadsForExport = vi.fn()

vi.mock('../../../lib/services/require-admin', () => ({ requireAdmin }))
vi.mock('../../../lib/services/leads', () => ({ listLeadsForExport }))

const { GET } = await import('./route')

const ARTICLE_ID = '4b4f7c5e-2d7a-4c1e-9d55-0a3f5c1e8b21'
const supabase = { marker: 'supabase' }
const LEAD: LeadRow = {
  id: '1',
  created_at: '2026-09-24T17:32:00Z',
  article_title_snapshot: 'Ações & câmbio',
  name: '@Maria',
  email: 'maria@example.com',
  phone: '+5511912345678',
  marketing_opt_in: true,
  webhook_status: 'sent',
}

const request = (query = '') => new Request(`http://localhost/leads/exportar${query}`)

describe('GET /leads/exportar', () => {
  beforeEach(() => {
    requireAdmin.mockResolvedValue({ ok: true, supabase, userId: 'admin' })
    listLeadsForExport.mockResolvedValue([LEAD])
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('sem admin: 401 sem consultar leads', async () => {
    requireAdmin.mockResolvedValue({ ok: false, error: 'Sessão expirada' })

    const response = await GET(request())

    expect(response.status).toBe(401)
    expect(listLeadsForExport).not.toHaveBeenCalled()
  })

  it('CSV geral como anexo, com BOM e célula escapada', async () => {
    const response = await GET(request())

    expect(response.headers.get('content-type')).toBe('text/csv; charset=utf-8')
    expect(response.headers.get('content-disposition')).toMatch(
      /^attachment; filename="leads-\d{4}-\d{2}-\d{2}\.csv"$/,
    )
    const bytes = new Uint8Array(await response.arrayBuffer())
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    expect(new TextDecoder().decode(bytes)).toContain(";Ações & câmbio;'@Maria;")
    expect(listLeadsForExport).toHaveBeenCalledWith(supabase, null)
  })

  it('filtra pelo artigo e recusa id inválido', async () => {
    await GET(request(`?artigo=${ARTICLE_ID}`))
    expect(listLeadsForExport).toHaveBeenCalledWith(supabase, ARTICLE_ID)

    expect((await GET(request('?artigo=xyz'))).status).toBe(400)
  })

  it('falha na leitura: 500 genérico', async () => {
    listLeadsForExport.mockResolvedValue(null)

    expect((await GET(request())).status).toBe(500)
  })
})
