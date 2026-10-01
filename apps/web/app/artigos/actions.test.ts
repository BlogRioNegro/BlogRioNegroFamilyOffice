import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GENERIC_ERROR_MESSAGE } from '@/lib/services/action-result'
import { listArticles } from '@/lib/services/articles'
import { loadMoreArticles } from './actions'

vi.mock('@/lib/services/articles', () => ({
  listArticles: vi.fn(),
  toArticleCard: (article: { slug: string }) => ({ slug: article.slug }),
}))

const listArticlesMock = vi.mocked(listArticles)

function rows(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `id-${index}`,
    slug: `artigo-${index}`,
    title: `Artigo ${index}`,
    summary: null,
    cover_path: `id-${index}/capa.jpg`,
    content_type: 'pdf' as const,
    published_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
  }))
}

describe('loadMoreArticles', () => {
  beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('busca o lote pedido e indica o próximo quando há mais artigos', async () => {
    listArticlesMock.mockResolvedValue(rows(11))

    const result = await loadMoreArticles(2)

    expect(listArticlesMock).toHaveBeenCalledWith({ from: 11, to: 21 })
    expect(result).toEqual({
      ok: true,
      data: { articles: rows(10).map(({ slug }) => ({ slug })), nextPage: 3 },
    })
  })

  it('no último lote, nextPage é null', async () => {
    listArticlesMock.mockResolvedValue(rows(4))

    const result = await loadMoreArticles(3)

    expect(result).toMatchObject({ ok: true, data: { nextPage: null } })
  })

  it.each([1, 0, -1, 2.5, '2', null, 10_001])(
    'rejeita página inválida (%j) sem consultar o banco',
    async (page) => {
      expect(await loadMoreArticles(page)).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
      expect(listArticlesMock).not.toHaveBeenCalled()
    },
  )

  it('falha do banco vira erro genérico, sem detalhe interno', async () => {
    listArticlesMock.mockRejectedValue(new Error('relation "articles" does not exist'))

    const result = await loadMoreArticles(2)

    expect(result).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
  })
})
