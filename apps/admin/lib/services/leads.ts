import 'server-only'
import { pageRange, type LeadRow } from '../domain/leads'
import { logger } from './logger'
import type { AdminContext } from './require-admin'

type Supabase = AdminContext['supabase']

const LEAD_COLUMNS =
  'id, created_at, article_title_snapshot, name, email, phone, marketing_opt_in, webhook_status'

// O PostgREST devolve no máximo 1000 linhas por request: a exportação lê em lotes.
const EXPORT_BATCH = 1000

/** Filtro por artigo; sem artigo, a lista geral inclui os leads de artigos excluídos. */
function leadsQuery(supabase: Supabase, articleId: string | null) {
  const query = supabase
    .from('leads')
    .select(LEAD_COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
  return articleId ? query.eq('article_id', articleId) : query
}

/** ADM-013 · Uma página de leads (created_at desc) e o total. */
export async function listLeads(
  supabase: Supabase,
  articleId: string | null,
  page: number,
): Promise<{ leads: LeadRow[]; total: number }> {
  const { from, to } = pageRange(page)
  const { data, error, count } = await leadsQuery(supabase, articleId).range(from, to)
  if (error) {
    logger.error('admin.leads_list_failed', { error })
    throw new Error('Falha ao listar leads')
  }
  return { leads: data, total: count ?? 0 }
}

/** Todos os leads do filtro, para o CSV. */
export async function listLeadsForExport(
  supabase: Supabase,
  articleId: string | null,
): Promise<LeadRow[] | null> {
  const leads: LeadRow[] = []
  for (let from = 0; ; from += EXPORT_BATCH) {
    const { data, error } = await leadsQuery(supabase, articleId).range(
      from,
      from + EXPORT_BATCH - 1,
    )
    if (error) {
      logger.error('admin.leads_export_failed', { error })
      return null
    }
    leads.push(...data)
    if (data.length < EXPORT_BATCH) return leads
  }
}

/** Título e slug atuais do artigo, ou null se ele não existe. */
export async function findArticleSummary(supabase: Supabase, articleId: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug')
    .eq('id', articleId)
    .maybeSingle()
  if (error) {
    logger.error('admin.article_find_failed', { error })
    throw new Error('Falha ao carregar o artigo')
  }
  return data
}

/** ADM-013 · Exclusão a pedido do titular. */
export async function deleteLeadRecord(supabase: Supabase, id: string) {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  return error
}
