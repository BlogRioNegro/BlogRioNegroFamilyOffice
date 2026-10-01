import { randomUUID } from 'node:crypto'
import type { Database } from '@rio-negro/db'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  adminClient,
  anonClient,
  createAuthenticatedUser,
  serviceClient,
  type Client,
  type TestUser,
} from './support/clients'

// DATA-002 · DATA-003 · ADM-004 · save_article grava artigo, conteúdo e histórico de slug numa
// transação, com a RLS de quem chama (security invoker).

type SaveArticleArgs = Database['public']['Functions']['save_article']['Args']

function pdfArticle(id: string, slug: string): SaveArticleArgs {
  return {
    article_id: id,
    slug,
    title: 'Artigo salvo pela função',
    cover_path: `${id}/capa.png`,
    content_type: 'pdf',
    published_at: new Date().toISOString(),
    full_pdf_path: `${id}/completo.pdf`,
    preview_pdf_path: `${id}/previa.pdf`,
  }
}

describe('save_article', () => {
  let service: Client
  let admin: Client
  let user: TestUser
  const ids: string[] = []

  function newId() {
    const id = randomUUID()
    ids.push(id)
    return id
  }

  async function articleExists(id: string) {
    const { data } = await service.from('articles').select('id').eq('id', id).maybeSingle()
    return data !== null
  }

  beforeAll(async () => {
    service = serviceClient()
    admin = await adminClient()
    user = await createAuthenticatedUser()
  })

  afterAll(async () => {
    await service.from('articles').delete().in('id', ids)
    await user.remove()
  })

  it('admin cria o artigo e o conteúdo juntos', async () => {
    const id = newId()
    const { data, error } = await admin.rpc('save_article', pdfArticle(id, `salvo-${id}`))

    expect(error).toBeNull()
    expect(data).toBe(id)
    const { data: content } = await service
      .from('article_contents')
      .select('full_pdf_path')
      .eq('article_id', id)
      .single()
    expect(content?.full_pdf_path).toBe(`${id}/completo.pdf`)
  })

  it('admin atualiza o artigo e o slug anterior vai para o histórico', async () => {
    const id = newId()
    await admin.rpc('save_article', pdfArticle(id, `antigo-${id}`))

    const { error } = await admin.rpc('save_article', {
      ...pdfArticle(id, `novo-${id}`),
      title: 'Título editado',
    })

    expect(error).toBeNull()
    const { data: article } = await service
      .from('articles')
      .select('slug, title')
      .eq('id', id)
      .single()
    expect(article).toEqual({ slug: `novo-${id}`, title: 'Título editado' })
    const { data: history } = await service
      .from('article_slug_history')
      .select('old_slug')
      .eq('article_id', id)
    expect(history).toEqual([{ old_slug: `antigo-${id}` }])
  })

  // ADM-009 · Slug em uso (atual ou histórico de outro artigo) é rejeitado com 23505, que a
  // Server Action mostra como erro no campo Slug.
  it('rejeita o slug atual de outro artigo', async () => {
    const first = newId()
    const second = newId()
    await admin.rpc('save_article', pdfArticle(first, `ocupado-${first}`))

    const { error } = await admin.rpc('save_article', pdfArticle(second, `ocupado-${first}`))

    expect(error?.code).toBe('23505')
    expect(await articleExists(second)).toBe(false)
  })

  it('rejeita o slug do histórico de outro artigo e aceita voltar ao próprio', async () => {
    const owner = newId()
    const other = newId()
    await admin.rpc('save_article', pdfArticle(owner, `velho-${owner}`))
    await admin.rpc('save_article', pdfArticle(owner, `atual-${owner}`))
    await admin.rpc('save_article', pdfArticle(other, `outro-${other}`))

    const taken = await admin.rpc('save_article', pdfArticle(other, `velho-${owner}`))
    const back = await admin.rpc('save_article', pdfArticle(owner, `velho-${owner}`))

    expect(taken.error?.code).toBe('23505')
    expect(back.error).toBeNull()
    const { data: history } = await service
      .from('article_slug_history')
      .select('old_slug')
      .eq('article_id', owner)
    expect(history).toEqual([{ old_slug: `atual-${owner}` }])
  })

  it('é atômica: conteúdo inválido desfaz também o artigo', async () => {
    const id = newId()
    const { error } = await admin.rpc('save_article', {
      ...pdfArticle(id, `atomico-${id}`),
      content_type: 'rich_text',
      preview_pdf_path: undefined,
      preview_json: { type: 'doc', content: [] },
    })

    expect(error).not.toBeNull()
    expect(await articleExists(id)).toBe(false)
  })

  it('anon não executa a função', async () => {
    const id = newId()
    const { error } = await anonClient().rpc('save_article', pdfArticle(id, `anon-${id}`))

    expect(error?.code).toBe('42501')
    expect(await articleExists(id)).toBe(false)
  })

  it('autenticado fora de admin_users é barrado pela RLS', async () => {
    const id = newId()
    const { error } = await user.client.rpc('save_article', pdfArticle(id, `comum-${id}`))

    expect(error?.code).toBe('42501')
    expect(await articleExists(id)).toBe(false)
  })

  it('autenticado fora de admin_users não altera artigo existente', async () => {
    const id = newId()
    await admin.rpc('save_article', pdfArticle(id, `existente-${id}`))

    const { error } = await user.client.rpc('save_article', {
      ...pdfArticle(id, `existente-${id}`),
      title: 'Invadido',
    })

    expect(error?.code).toBe('42501')
    const { data } = await service.from('articles').select('title').eq('id', id).single()
    expect(data?.title).toBe('Artigo salvo pela função')
  })
})
