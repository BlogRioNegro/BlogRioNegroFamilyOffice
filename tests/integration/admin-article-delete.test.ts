import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { adminClient, serviceClient, type Client } from './support/clients'
import { localSupabase } from './support/local-supabase'

// ADM-012 · ADR 0013 · Excluir o artigo pela Server Action (sessão do admin): some o artigo, o
// conteúdo, o histórico de slug e os arquivos; o lead fica com article_id null e o título original.

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', localSupabase.API_URL)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', localSupabase.ANON_KEY)
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
vi.stubEnv('ADMIN_SITE_URL', 'http://localhost:3001')

const session: { supabase: Client | null } = { supabase: null }
vi.mock('../../apps/admin/lib/services/require-admin', () => ({
  requireAdmin: async () => ({ ok: true, supabase: session.supabase, userId: 'admin' }),
}))

const { deleteArticle } = await import('../../apps/admin/app/artigos/actions')

const BUCKETS = ['covers', 'article-images', 'article-files', 'article-previews'] as const
const MIME = {
  covers: 'image/png',
  'article-images': 'image/png',
  'article-files': 'application/pdf',
  'article-previews': 'application/pdf',
} as const
const TITLE = 'Artigo que será excluído'

describe('ADM-012 · deleteArticle', () => {
  const id = randomUUID()
  let service: Client
  let leadId = ''

  beforeAll(async () => {
    service = serviceClient()
    session.supabase = await adminClient()

    const article = {
      article_id: id,
      title: TITLE,
      cover_path: `${id}/capa.png`,
      content_type: 'pdf' as const,
      published_at: new Date().toISOString(),
      full_pdf_path: `${id}/completo.pdf`,
      preview_pdf_path: `${id}/previa.pdf`,
    }
    await session.supabase.rpc('save_article', { ...article, slug: `excluir-antigo-${id}` })
    const { error } = await session.supabase.rpc('save_article', {
      ...article,
      slug: `excluir-${id}`,
    })
    if (error) throw error
    for (const bucket of BUCKETS) {
      const upload = await service.storage
        .from(bucket)
        .upload(`${id}/arquivo`, new Blob(['x'], { type: MIME[bucket] }))
      if (upload.error) throw upload.error
    }
    const lead = await service
      .from('leads')
      .insert({
        article_id: id,
        article_title_snapshot: TITLE,
        name: 'Pessoa Teste',
        email: `lead-${randomUUID()}@example.com`,
        phone: '+5511912345678',
        consent_at: new Date().toISOString(),
        policy_version: 'v1',
        ip_hash: 'hash',
      })
      .select('id')
      .single()
    if (lead.error) throw lead.error
    leadId = lead.data.id
  })

  afterAll(async () => {
    await service.from('leads').delete().eq('id', leadId)
    await service.from('articles').delete().eq('id', id)
    for (const bucket of BUCKETS) await service.storage.from(bucket).remove([`${id}/arquivo`])
    vi.unstubAllEnvs()
  })

  it('remove artigo, conteúdo, histórico e arquivos, e preserva o lead', async () => {
    expect(await deleteArticle(id)).toEqual({ ok: true, data: null })

    const article = await service.from('articles').select('id').eq('id', id)
    const content = await service.from('article_contents').select('article_id').eq('article_id', id)
    const history = await service
      .from('article_slug_history')
      .select('old_slug')
      .eq('article_id', id)
    expect(article.data).toEqual([])
    expect(content.data).toEqual([])
    expect(history.data).toEqual([])
    for (const bucket of BUCKETS) {
      const { data } = await service.storage.from(bucket).list(id)
      expect(data, bucket).toEqual([])
    }

    const { data: lead } = await service
      .from('leads')
      .select('article_id, article_title_snapshot')
      .eq('id', leadId)
      .single()
    expect(lead).toEqual({ article_id: null, article_title_snapshot: TITLE })
  })
})
