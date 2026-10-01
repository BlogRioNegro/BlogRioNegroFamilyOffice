import 'server-only'
import type { Database } from '@rio-negro/db'
import type { Bucket } from '../domain/upload-rules'
import { logger } from './logger'
import type { AdminContext } from './require-admin'

type Supabase = AdminContext['supabase']

export type SaveArticleArgs = Database['public']['Functions']['save_article']['Args']

const EDIT_COLUMNS =
  'id, slug, title, summary, cover_path, content_type, preview_json, preview_pdf_path, published_at, article_contents(body_json, full_pdf_path)'

/** ADM-004 · Artigo com o conteúdo completo, para a edição (article_contents só o admin lê). */
export async function findArticleForEdit(supabase: Supabase, id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(EDIT_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    logger.error('admin.article_find_failed', { error })
    throw new Error('Falha ao carregar o artigo')
  }
  return data
}

export type ArticleForEdit = NonNullable<Awaited<ReturnType<typeof findArticleForEdit>>>

/** Artigo, conteúdo e histórico de slug numa transação (função save_article, sob RLS). */
export async function saveArticleRecord(supabase: Supabase, args: SaveArticleArgs) {
  const { error } = await supabase.rpc('save_article', args)
  return error
}

/** ADM-012 · Conteúdo e histórico de slug saem em cascata; os leads ficam com article_id null. */
export async function deleteArticleRecord(supabase: Supabase, id: string) {
  const { error } = await supabase.from('articles').delete().eq('id', id)
  return error
}

export async function uploadFile(supabase: Supabase, bucket: Bucket, path: string, file: Blob) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false })
  return error
}

/** Remove arquivos que deixaram de ser usados; falha só vai para o log. */
export async function removeFiles(supabase: Supabase, bucket: Bucket, paths: string[]) {
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(bucket).remove(paths)
  if (error) logger.warn('admin.storage_remove_failed', { bucket, error })
}

/** Caminhos dos arquivos na pasta do artigo (`<article_id>/`); falha na listagem vai para o log. */
export async function listArticleFiles(
  supabase: Supabase,
  bucket: Bucket,
  articleId: string,
): Promise<string[]> {
  const { data, error } = await supabase.storage.from(bucket).list(articleId)
  if (error) {
    logger.warn('admin.storage_list_failed', { bucket, error })
    return []
  }
  return data.map((file) => `${articleId}/${file.name}`)
}

export function publicFileUrl(supabase: Supabase, bucket: 'article-images', path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

/** Bytes de um arquivo do Storage, ou null se não foi possível baixar. */
export async function downloadFile(
  supabase: Supabase,
  bucket: Bucket,
  path: string,
): Promise<Uint8Array | null> {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error) {
    logger.warn('admin.storage_download_failed', { bucket, error })
    return null
  }
  return new Uint8Array(await data.arrayBuffer())
}
