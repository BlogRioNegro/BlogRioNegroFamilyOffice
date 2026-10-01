import 'server-only'
import { logger } from './logger'
import type { AdminContext } from './require-admin'

// ADM-003 · Artigos na ordem do site (o primeiro é o destaque) com o nº de leads de cada um.
export async function listArticlesWithLeadCount(supabase: AdminContext['supabase']) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, content_type, published_at, leads(count)')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (error) {
    logger.error('admin.articles_list_failed', { error })
    throw new Error('Falha ao listar artigos')
  }
  return data.map(({ leads, ...article }) => ({ ...article, leadCount: leads[0]?.count ?? 0 }))
}

export type ArticleRow = Awaited<ReturnType<typeof listArticlesWithLeadCount>>[number]
