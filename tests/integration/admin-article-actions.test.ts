import { randomUUID } from 'node:crypto'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { serviceClient } from './support/clients'
import { localSupabase } from './support/local-supabase'

// SEC-005 · Server Actions e route handlers do admin chamados sem cookie de sessão: erro de autorização e
// nenhum dado alterado.

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', localSupabase.API_URL)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', localSupabase.ANON_KEY)
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
vi.stubEnv('ADMIN_SITE_URL', 'http://localhost:3001')

const { deleteArticle, saveArticle, uploadArticleImage } =
  await import('../../apps/admin/app/artigos/actions')
const { UNAUTHORIZED_MESSAGE } = await import('../../apps/admin/lib/services/require-admin')
const { deleteLead, resendWebhookFailures } = await import('../../apps/admin/app/leads/actions')
const { GET: exportLeads } = await import('../../apps/admin/app/leads/exportar/route')

const ARTICLE_ID = '22222222-2222-4222-8222-222222222222'

describe('SEC-005 · actions de artigo sem sessão', () => {
  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('saveArticle nega e não altera o artigo', async () => {
    const formData = new FormData()
    formData.set('id', ARTICLE_ID)
    formData.set('title', 'Título trocado sem sessão')
    formData.set('slug', 'carteira-recomendada-outubro')
    formData.set('summary', '')
    formData.set('contentType', 'pdf')
    formData.set('publishedDate', '2026-09-20')

    const result = await saveArticle(null, formData)

    expect(result).toEqual({ ok: false, error: UNAUTHORIZED_MESSAGE, fieldErrors: {} })
    const { data } = await serviceClient()
      .from('articles')
      .select('title')
      .eq('id', ARTICLE_ID)
      .single()
    expect(data?.title).toBe('Carteira recomendada de outubro')
  })

  it('deleteArticle nega e não exclui o artigo', async () => {
    const result = await deleteArticle(ARTICLE_ID)

    expect(result).toEqual({ ok: false, error: UNAUTHORIZED_MESSAGE })
    const { data } = await serviceClient()
      .from('articles')
      .select('id')
      .eq('id', ARTICLE_ID)
      .maybeSingle()
    expect(data?.id).toBe(ARTICLE_ID)
  })

  it('uploadArticleImage nega e não envia a imagem', async () => {
    const formData = new FormData()
    formData.set('articleId', ARTICLE_ID)
    formData.set('image', new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'foto.png'))

    const result = await uploadArticleImage(formData)

    expect(result).toEqual({ ok: false, error: UNAUTHORIZED_MESSAGE })
    const { data } = await serviceClient().storage.from('article-images').list(ARTICLE_ID)
    expect(data).toEqual([])
  })

  it('deleteLead nega e não consulta o banco', async () => {
    expect(await deleteLead(randomUUID())).toEqual({ ok: false, error: UNAUTHORIZED_MESSAGE })
  })

  it('exportação de leads responde 401 sem CSV', async () => {
    const response = await exportLeads(new Request('http://localhost/leads/exportar'))

    expect(response.status).toBe(401)
    expect(response.headers.get('content-type')).not.toContain('text/csv')
  })

  it('resendWebhookFailures nega sem reenviar', async () => {
    expect(await resendWebhookFailures(null)).toEqual({ ok: false, error: UNAUTHORIZED_MESSAGE })
  })
})
