'use server'

import { z } from 'zod'
import { lotRange, MAX_PAGE, splitLot } from '@/lib/domain/listing'
import { failAction, type ActionResult } from '@/lib/services/action-result'
import { listArticles, toArticleCard, type ArticleCardData } from '@/lib/services/articles'

const pageSchema = z.int().min(2).max(MAX_PAGE)

export type ArticleLot = { articles: ArticleCardData[]; nextPage: number | null }

// PUB-004 · Próximo lote do "Carregar mais". O lote 1 vem sempre renderizado pela página.
export async function loadMoreArticles(page: unknown): Promise<ActionResult<ArticleLot>> {
  const parsed = pageSchema.safeParse(page)
  if (!parsed.success) return failAction('articles.load_more_invalid_page', parsed.error)

  try {
    const { articles, hasMore } = splitLot(await listArticles(lotRange(parsed.data)))
    return {
      ok: true,
      data: { articles: articles.map(toArticleCard), nextPage: hasMore ? parsed.data + 1 : null },
    }
  } catch (error) {
    return failAction('articles.load_more_failed', error)
  }
}
