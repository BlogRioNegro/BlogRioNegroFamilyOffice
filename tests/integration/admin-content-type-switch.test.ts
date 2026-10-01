import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { adminClient, serviceClient, type Client } from './support/clients'
import { localSupabase } from './support/local-supabase'

// ADM-011 · Troca de content_type pela Server Action, com a sessão do admin e o Storage local:
// nenhum arquivo do tipo anterior fica órfão.

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', localSupabase.API_URL)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', localSupabase.ANON_KEY)
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
vi.stubEnv('ADMIN_SITE_URL', 'http://localhost:3001')

const session: { supabase: Client | null } = { supabase: null }
vi.mock('../../apps/admin/lib/services/require-admin', () => ({
  requireAdmin: async () => ({ ok: true, supabase: session.supabase, userId: 'admin' }),
}))

const { saveArticle, uploadArticleImage } = await import('../../apps/admin/app/artigos/actions')

const STORAGE = path.resolve(import.meta.dirname, '../../supabase/storage')
const PNG = readFileSync(
  path.join(
    STORAGE,
    'covers/11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
  ),
)
const PDF = readFileSync(
  path.join(
    STORAGE,
    'article-previews/22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf',
  ),
)
const BUCKETS = ['covers', 'article-images', 'article-files', 'article-previews'] as const

describe('ADM-011 · troca de content_type sem arquivos órfãos', () => {
  const id = randomUUID()
  const slug = `troca-de-tipo-${id}`
  let service: Client

  function form(fields: Record<string, string | File>) {
    const formData = new FormData()
    const values = {
      id,
      title: 'Troca de tipo',
      slug,
      summary: '',
      publishedDate: '2026-09-20',
      ...fields,
    }
    for (const [name, value] of Object.entries(values)) formData.set(name, value)
    return formData
  }

  async function filesByBucket() {
    const entries = await Promise.all(
      BUCKETS.map(async (bucket) => {
        const { data } = await service.storage.from(bucket).list(id)
        return [bucket, (data ?? []).map((file) => `${id}/${file.name}`)] as const
      }),
    )
    return Object.fromEntries(entries)
  }

  async function savedPaths() {
    const { data } = await service
      .from('articles')
      .select('cover_path, preview_pdf_path, article_contents(full_pdf_path)')
      .eq('id', id)
      .single()
    return data
  }

  function richText(content: object[]) {
    return JSON.stringify({ type: 'doc', content })
  }

  beforeAll(async () => {
    service = serviceClient()
    session.supabase = await adminClient()
  })

  afterAll(async () => {
    await service.from('articles').delete().eq('id', id)
    const files = await filesByBucket()
    for (const bucket of BUCKETS) {
      if (files[bucket]?.length) await service.storage.from(bucket).remove(files[bucket])
    }
    vi.unstubAllEnvs()
  })

  it('rich_text → pdf → rich_text deixa só os arquivos do tipo atual', async () => {
    const image = await uploadArticleImage(
      form({ articleId: id, image: new File([PNG], 'grafico.png') }),
    )
    if (!image.ok) throw new Error(image.error)
    const paragraph = { type: 'paragraph', content: [{ type: 'text', text: 'Primeiro bloco.' }] }
    const withImage = [paragraph, { type: 'image', attrs: { src: image.data.src, alt: 'Gráfico' } }]

    await expect(
      saveArticle(
        null,
        form({
          contentType: 'rich_text',
          body: richText(withImage),
          cover: new File([PNG], 'capa.png'),
        }),
      ),
    ).rejects.toThrow('NEXT_REDIRECT')
    const asRichText = await savedPaths()
    expect(await filesByBucket()).toEqual({
      covers: [asRichText?.cover_path],
      'article-images': [expect.stringMatching(new RegExp(`^${id}/.+\\.png$`))],
      'article-files': [asRichText?.article_contents?.full_pdf_path],
      'article-previews': [],
    })

    await expect(
      saveArticle(null, form({ contentType: 'pdf', pdf: new File([PDF], 'artigo.pdf') })),
    ).rejects.toThrow('NEXT_REDIRECT')
    const asPdf = await savedPaths()
    expect(await filesByBucket()).toEqual({
      covers: [asRichText?.cover_path],
      'article-images': [],
      'article-files': [asPdf?.article_contents?.full_pdf_path],
      'article-previews': [asPdf?.preview_pdf_path],
    })

    await expect(
      saveArticle(null, form({ contentType: 'rich_text', body: richText([paragraph]) })),
    ).rejects.toThrow('NEXT_REDIRECT')
    const back = await savedPaths()
    expect(back?.preview_pdf_path).toBeNull()
    expect(await filesByBucket()).toEqual({
      covers: [asRichText?.cover_path],
      'article-images': [],
      'article-files': [back?.article_contents?.full_pdf_path],
      'article-previews': [],
    })
  })
})
