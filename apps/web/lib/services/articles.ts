import 'server-only'
import { cache } from 'react'
import { formatPublishedDate } from '../domain/published-date'
import { logger } from './logger'
import { createPublicClient } from './supabase-public'

// PUB-009 · Leitura pública de artigos: só colunas de `articles` (ADR 0007). O conteúdo
// completo e o PDF completo nunca são lidos por este módulo.
const LIST_COLUMNS =
  'id, slug, title, subtitle, summary, cover_path, content_type, published_at, created_at'
const DETAIL_COLUMNS = `${LIST_COLUMNS}, preview_json, preview_pdf_path`

export type ArticleListItem = Awaited<ReturnType<typeof listArticles>>[number]
export type ArticleDetail = NonNullable<Awaited<ReturnType<typeof getArticleBySlug>>>

/** Artigos em ordem de publicação (mais recente primeiro), da posição `from` até `to`, inclusive. */
export async function listArticles(range: { from: number; to: number }) {
  const { data, error } = await createPublicClient()
    .from('articles')
    .select(LIST_COLUMNS)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(range.from, range.to)

  if (error) {
    logger.error('articles.list_failed', { error })
    throw new Error('Falha ao listar artigos')
  }
  return data
}

// cache: generateMetadata e a página leem o mesmo artigo com uma consulta por request.
export const getArticleBySlug = cache(async (slug: string) => {
  const { data, error } = await createPublicClient()
    .from('articles')
    .select(DETAIL_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    logger.error('articles.get_failed', { error })
    throw new Error('Falha ao carregar o artigo')
  }
  return data
})

/** LEAD-007 (4) · Artigo publicado pelo id, com o título para o snapshot do lead. */
export async function findArticleForLead(articleId: string) {
  const { data, error } = await createPublicClient()
    .from('articles')
    .select('id, title')
    .eq('id', articleId)
    .maybeSingle()

  if (error) {
    logger.error('articles.find_for_lead_failed', { error })
    throw new Error('Falha ao consultar o artigo do lead')
  }
  return data
}

/** PUB-012 · Artigos mais recentes com a prévia rich_text, para a descrição do RSS. */
export async function listFeedArticles(limit: number) {
  const { data, error } = await createPublicClient()
    .from('articles')
    .select(`${LIST_COLUMNS}, preview_json`)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error('articles.feed_failed', { error })
    throw new Error('Falha ao listar artigos do feed')
  }
  return data
}

/** PUB-011 · Slug atual e última alteração de todos os artigos, para o sitemap. */
export async function listArticleSlugs() {
  const { data, error } = await createPublicClient()
    .from('articles')
    .select('slug, updated_at')
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })

  if (error) {
    logger.error('articles.slugs_failed', { error })
    throw new Error('Falha ao listar os slugs')
  }
  return data
}

/** PUB-008 · Slug atual do artigo que já usou `oldSlug`, ou null se o slug nunca foi trocado. */
export async function findCurrentSlug(oldSlug: string): Promise<string | null> {
  const { data, error } = await createPublicClient()
    .from('article_slug_history')
    .select('articles(slug)')
    .eq('old_slug', oldSlug)
    .maybeSingle()

  if (error) {
    logger.error('articles.slug_history_failed', { error })
    throw new Error('Falha ao consultar o histórico de slugs')
  }
  return data?.articles?.slug ?? null
}

function publicUrl(bucket: 'covers' | 'article-previews', path: string): string {
  return createPublicClient().storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export function coverUrl(coverPath: string): string {
  return publicUrl('covers', coverPath)
}

/** PDF de prévia (2 páginas) do bucket público; o PDF completo nunca passa por aqui. */
export function previewPdfUrl(previewPdfPath: string): string {
  return publicUrl('article-previews', previewPdfPath)
}

/** Dados serializáveis de um card, usados no server e no "Carregar mais". */
export type ArticleCardData = {
  slug: string
  title: string
  subtitle: string | null
  coverUrl: string
  publishedAt: string
  dateLabel: string
}

export function toArticleCard(article: ArticleListItem): ArticleCardData {
  return {
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    coverUrl: coverUrl(article.cover_path),
    publishedAt: article.published_at,
    dateLabel: formatPublishedDate(article.published_at),
  }
}
