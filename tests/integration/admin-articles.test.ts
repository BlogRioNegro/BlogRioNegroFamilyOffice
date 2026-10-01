import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { adminClient, serviceClient, type Client } from './support/clients'
import { localSupabase } from './support/local-supabase'

// ADM-003 · Lista do admin: ordem do site e nº de leads por artigo (lidos com a sessão do admin).

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', localSupabase.API_URL)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', localSupabase.ANON_KEY)
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
vi.stubEnv('ADMIN_SITE_URL', 'http://localhost:3001')

const { listArticlesWithLeadCount } = await import('../../apps/admin/lib/services/articles')

const ARTICLE_ID = '22222222-2222-4222-8222-222222222222'

describe('ADM-003 · listArticlesWithLeadCount', () => {
  let service: Client
  const leadIds: string[] = []

  beforeAll(async () => {
    service = serviceClient()
    const leads = [1, 2].map(() => ({
      article_id: ARTICLE_ID,
      article_title_snapshot: 'Carteira recomendada de outubro',
      name: 'Pessoa Teste',
      email: `lead-${randomUUID()}@example.com`,
      phone: '+5511912345678',
      consent_at: new Date().toISOString(),
      policy_version: 'v1',
      ip_hash: 'hash',
    }))
    const { data, error } = await service.from('leads').insert(leads).select('id')
    if (error) throw error
    leadIds.push(...data.map((lead) => lead.id))
  })

  afterAll(async () => {
    await service.from('leads').delete().in('id', leadIds)
    vi.unstubAllEnvs()
  })

  it('ordena por published_at desc e conta os leads de cada artigo', async () => {
    const articles = await listArticlesWithLeadCount(await adminClient())

    const dates = articles.map((article) => Date.parse(article.published_at))
    expect(dates).toEqual([...dates].sort((a, b) => b - a))
    expect(articles.find((article) => article.id === ARTICLE_ID)?.leadCount).toBe(2)
  })
})
