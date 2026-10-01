'use server'

import { randomUUID } from 'node:crypto'
import type { JSONContent } from '@tiptap/core'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { publishedAtFromDate } from '../../lib/domain/admin-date'
import {
  ARTICLE_MESSAGES,
  articleFieldsFrom,
  articleFieldsSchema,
  fieldErrorsOf,
  fileFrom,
  type ArticleFields,
  type FieldErrors,
} from '../../lib/domain/article-form'
import { createPdfPreview } from '../../lib/domain/pdf-preview'
import {
  checkRichText,
  imageSources,
  parseBodyField,
  richTextPreview,
} from '../../lib/domain/rich-text'
import { sizeError, type Bucket } from '../../lib/domain/upload-rules'
import {
  failAction,
  GENERIC_ERROR_MESSAGE,
  type ActionResult,
} from '../../lib/services/action-result'
import { pdfImage, renderArticlePdf, type PdfImage } from '../../lib/services/article-pdf'
import {
  downloadFile,
  deleteArticleRecord,
  findArticleForEdit,
  listArticleFiles,
  publicFileUrl,
  removeFiles,
  saveArticleRecord,
  uploadFile,
  type ArticleForEdit,
  type SaveArticleArgs,
} from '../../lib/services/article-store'
import { requireAdmin } from '../../lib/services/require-admin'
import { validateUpload } from '../../lib/services/upload'

type Supabase = Parameters<typeof publicFileUrl>[0]

export type SaveArticleState = { ok: false; error: string; fieldErrors: FieldErrors } | null

const INVALID_FORM_MESSAGE = 'Confira os campos destacados.'

// Slug atual ou do histórico de outro artigo (unique de articles.slug ou trigger de DATA-003).
const UNIQUE_VIOLATION = '23505'

type ContentValues = Pick<
  SaveArticleArgs,
  'preview_json' | 'preview_pdf_path' | 'body_json' | 'full_pdf_path'
>

type Upload = { bucket: Bucket; path: string; file: Blob }

type Content = { ok: true; values: ContentValues; uploads: Upload[] } | { ok: false; error: string }

// ADM-005 · Imagens do rich text só do bucket article-images, na pasta do próprio artigo.
function articleImagesPrefix(supabase: Supabase, articleId: string) {
  return publicFileUrl(supabase, 'article-images', `${articleId}/`)
}

function invalid(fieldErrors: FieldErrors): SaveArticleState {
  return { ok: false, error: INVALID_FORM_MESSAGE, fieldErrors }
}

function newPath(articleId: string, extension: string): string {
  return `${articleId}/${randomUUID()}.${extension}`
}

// Conteúdo atual do artigo, reaproveitado quando o tipo não mudou e nada novo foi enviado.
function keptContent(
  existing: ArticleForEdit | null,
  contentType: ArticleFields['contentType'],
): ContentValues | null {
  const contents = existing?.article_contents
  if (!existing || !contents || existing.content_type !== contentType) return null
  return {
    preview_json: existing.preview_json ?? undefined,
    preview_pdf_path: existing.preview_pdf_path ?? undefined,
    body_json: contents.body_json ?? undefined,
    full_pdf_path: contents.full_pdf_path,
  }
}

// ADM-007 · PDF novo: original privado em article-files e prévia de 2 páginas em article-previews.
async function pdfContent(articleId: string, file: File): Promise<Content> {
  const original = await validateUpload('article-files', file)
  if (!original.ok) return original

  const preview = await createPdfPreview(new Uint8Array(await original.file.arrayBuffer()))
  if (!preview.ok) return preview

  const fullPath = newPath(articleId, 'pdf')
  const previewPath = newPath(articleId, 'pdf')
  return {
    ok: true,
    values: { full_pdf_path: fullPath, preview_pdf_path: previewPath },
    uploads: [
      { bucket: 'article-files', path: fullPath, file: original.file },
      {
        bucket: 'article-previews',
        path: previewPath,
        file: new Blob([new Uint8Array(preview.preview)], { type: 'application/pdf' }),
      },
    ],
  }
}

// Capa do PDF gerado: a nova, se veio no formulário, ou a atual do artigo.
async function coverBytes(
  supabase: Supabase,
  newCover: Blob | null,
  existing: ArticleForEdit | null,
): Promise<Uint8Array | null> {
  if (newCover) return new Uint8Array(await newCover.arrayBuffer())
  return existing ? downloadFile(supabase, 'covers', existing.cover_path) : null
}

// ADM-008 · Rich text: documento completo em body_json, 3 primeiros blocos em preview_json e PDF
// completo gerado (título, capa e conteúdo) em article-files. Regenerado a cada salvamento.
async function richTextContent(
  supabase: Supabase,
  fields: ArticleFields,
  doc: JSONContent,
  cover: Uint8Array | null,
): Promise<Content> {
  const prefix = articleImagesPrefix(supabase, fields.id)
  const images = new Map<string, PdfImage>()
  for (const src of new Set(imageSources(doc))) {
    const bytes = await downloadFile(
      supabase,
      'article-images',
      `${fields.id}/${src.slice(prefix.length)}`,
    )
    if (!bytes) return { ok: false, error: GENERIC_ERROR_MESSAGE }
    const image = await pdfImage(bytes)
    if (image) images.set(src, image)
  }

  const pdf = await renderArticlePdf({
    title: fields.title,
    cover: cover ? await pdfImage(cover) : null,
    doc,
    images,
  })
  const tooBig = sizeError('article-files', pdf.length)
  if (tooBig) return { ok: false, error: tooBig }

  const fullPath = newPath(fields.id, 'pdf')
  return {
    ok: true,
    values: { body_json: doc, preview_json: richTextPreview(doc), full_pdf_path: fullPath },
    uploads: [
      {
        bucket: 'article-files',
        path: fullPath,
        file: new Blob([new Uint8Array(pdf)], { type: 'application/pdf' }),
      },
    ],
  }
}

async function resolveContent(
  supabase: Supabase,
  fields: ArticleFields,
  existing: ArticleForEdit | null,
  formData: FormData,
  newCover: Blob | null,
): Promise<Content> {
  const pdf = fileFrom(formData, 'pdf')
  if (fields.contentType === 'pdf' && pdf) return pdfContent(fields.id, pdf)

  const body = formData.get('body')
  if (fields.contentType === 'rich_text' && body !== null) {
    const richText = checkRichText(parseBodyField(body), articleImagesPrefix(supabase, fields.id))
    if (!richText.ok) return richText
    const cover = await coverBytes(supabase, newCover, existing)
    return richTextContent(supabase, fields, richText.doc, cover)
  }

  const kept = keptContent(existing, fields.contentType)
  if (kept) return { ok: true, values: kept, uploads: [] }
  return {
    ok: false,
    error: fields.contentType === 'pdf' ? ARTICLE_MESSAGES.pdf : ARTICLE_MESSAGES.richText,
  }
}

/** Envia todos os arquivos ou nenhum: se um falha, os já enviados são removidos. */
async function uploadAll(supabase: Supabase, uploads: Upload[]): Promise<unknown> {
  const done: Upload[] = []
  for (const upload of uploads) {
    const error = await uploadFile(supabase, upload.bucket, upload.path, upload.file)
    if (error) {
      await removeUploads(supabase, done)
      return error
    }
    done.push(upload)
  }
  return null
}

async function removeUploads(supabase: Supabase, uploads: Pick<Upload, 'bucket' | 'path'>[]) {
  for (const upload of uploads) await removeFiles(supabase, upload.bucket, [upload.path])
}

// Arquivos do artigo que deixaram de ser referenciados depois de salvar (ADM-007: trocar o PDF
// remove os antigos; ADM-011: trocar o tipo remove a prévia e o PDF do tipo anterior).
function staleFiles(existing: ArticleForEdit | null, saved: SaveArticleArgs) {
  if (!existing) return []
  const previous = [
    { bucket: 'covers', path: existing.cover_path, current: saved.cover_path },
    {
      bucket: 'article-files',
      path: existing.article_contents?.full_pdf_path,
      current: saved.full_pdf_path,
    },
    {
      bucket: 'article-previews',
      path: existing.preview_pdf_path,
      current: saved.preview_pdf_path,
    },
  ] as const
  return previous.flatMap(({ bucket, path, current }) =>
    path && path !== current ? [{ bucket, path }] : [],
  )
}

/** ADM-004 · Salvar = publicar (ADR 0005). Valida com o mesmo schema do form. */
export async function saveArticle(
  _previous: SaveArticleState,
  formData: FormData,
): Promise<SaveArticleState> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ...auth, fieldErrors: {} }

  const parsed = articleFieldsSchema.safeParse(articleFieldsFrom(formData))
  if (!parsed.success) return invalid(fieldErrorsOf(parsed.error))
  const fields = parsed.data

  const existing = await findArticleForEdit(auth.supabase, fields.id)
  const coverFile = fileFrom(formData, 'cover')
  const cover = coverFile ? await validateUpload('covers', coverFile) : null
  const content = await resolveContent(
    auth.supabase,
    fields,
    existing,
    formData,
    cover?.ok ? cover.file : null,
  )

  const fieldErrors: FieldErrors = {}
  if (!existing && !cover) fieldErrors.cover = ARTICLE_MESSAGES.cover
  if (cover && !cover.ok) fieldErrors.cover = cover.error
  if (!content.ok) fieldErrors.content = content.error
  if (Object.keys(fieldErrors).length > 0 || !content.ok || (cover && !cover.ok))
    return invalid(fieldErrors)

  const coverUpload: Upload | null = cover
    ? { bucket: 'covers', path: newPath(fields.id, cover.extension), file: cover.file }
    : null
  const coverPath = coverUpload?.path ?? existing?.cover_path
  if (!coverPath) return invalid({ cover: ARTICLE_MESSAGES.cover })

  const uploads = [...(coverUpload ? [coverUpload] : []), ...content.uploads]
  const uploadError = await uploadAll(auth.supabase, uploads)
  if (uploadError) return { ...failAction('admin.article_upload_failed', uploadError), fieldErrors }

  const record: SaveArticleArgs = {
    article_id: fields.id,
    slug: fields.slug,
    title: fields.title,
    summary: fields.summary ?? undefined,
    cover_path: coverPath,
    content_type: fields.contentType,
    published_at: publishedAtFromDate(
      fields.publishedDate,
      existing?.published_at ?? null,
      new Date(),
    ),
    ...content.values,
  }
  const saveError = await saveArticleRecord(auth.supabase, record)
  if (saveError) {
    await removeUploads(auth.supabase, uploads)
    if (saveError.code === UNIQUE_VIOLATION) return invalid({ slug: ARTICLE_MESSAGES.slugTaken })
    return { ...failAction('admin.article_save_failed', saveError), fieldErrors }
  }

  await removeUploads(auth.supabase, staleFiles(existing, record))
  // ADM-011 · Rich text trocado por PDF: as imagens do editor ficariam órfãs em article-images.
  if (existing?.content_type === 'rich_text' && record.content_type === 'pdf') {
    const images = await listArticleFiles(auth.supabase, 'article-images', fields.id)
    await removeFiles(auth.supabase, 'article-images', images)
  }
  redirect('/artigos')
}

const ARTICLE_BUCKETS: Bucket[] = ['covers', 'article-images', 'article-files', 'article-previews']

export type DeleteArticleResult = ActionResult<null>

/** ADM-012 · Exclui o artigo e todos os arquivos dele; os leads permanecem (ADR 0013). */
export async function deleteArticle(articleId: string): Promise<DeleteArticleResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const id = z.uuid().safeParse(articleId)
  if (!id.success) return { ok: false, error: GENERIC_ERROR_MESSAGE }

  const deleteError = await deleteArticleRecord(auth.supabase, id.data)
  if (deleteError) return failAction('admin.article_delete_failed', deleteError)

  for (const bucket of ARTICLE_BUCKETS) {
    const paths = await listArticleFiles(auth.supabase, bucket, id.data)
    await removeFiles(auth.supabase, bucket, paths)
  }
  return { ok: true, data: null }
}

const IMAGE_MISSING_MESSAGE = 'Escolha uma imagem JPG ou PNG.'

export type UploadedImage = ActionResult<{ src: string }>

/** ADM-005 · ADM-006 · Imagem inline do editor: validada e enviada para article-images. */
export async function uploadArticleImage(formData: FormData): Promise<UploadedImage> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const articleId = z.uuid().safeParse(formData.get('articleId'))
  const file = fileFrom(formData, 'image')
  if (!articleId.success || !file) return { ok: false, error: IMAGE_MISSING_MESSAGE }

  const image = await validateUpload('article-images', file)
  if (!image.ok) return image

  const path = `${articleId.data}/${randomUUID()}.${image.extension}`
  const uploadError = await uploadFile(auth.supabase, 'article-images', path, image.file)
  if (uploadError) return failAction('admin.image_upload_failed', uploadError)

  return { ok: true, data: { src: publicFileUrl(auth.supabase, 'article-images', path) } }
}
