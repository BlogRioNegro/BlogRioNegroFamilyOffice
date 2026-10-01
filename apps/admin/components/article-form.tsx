'use client'

import { Alert, Button, FieldMessage, Label, TextField } from '@rio-negro/ui'
import { ArrowLeft, LoaderCircle } from '@rio-negro/ui/icons'
import type { JSONContent } from '@tiptap/core'
import Link from 'next/link'
import { startTransition, useActionState, useState, type FormEvent } from 'react'
import { saveArticle } from '@/app/artigos/actions'
import {
  ARTICLE_MESSAGES,
  articleFieldsFrom,
  articleFieldsSchema,
  fieldErrorsOf,
  fileFrom,
  slugFromTitle,
  type ArticleFields,
  type FieldErrors,
} from '@/lib/domain/article-form'
import { optimizeCover } from '@/lib/browser/optimize-cover'
import { coverSourceError } from '@/lib/domain/cover-image'
import { checkRichText, parseBodyField } from '@/lib/domain/rich-text'
import { formatMegabytes, IMAGE_ACCEPT, sizeError } from '@/lib/domain/upload-rules'
import { RichTextEditor } from './rich-text-editor'

export type ArticleFormValues = {
  id: string
  title: string
  slug: string
  summary: string
  contentType: ArticleFields['contentType']
  publishedDate: string
  body: JSONContent | null
}

const CONTENT_TYPES = [
  { value: 'rich_text', label: 'Texto' },
  { value: 'pdf', label: 'PDF' },
] as const

// Mesma aparência do Input (spec 05: "<textarea> com a aparência do Input").
const TEXTAREA_CLASSES =
  'w-full rounded-control border border-border-strong bg-surface p-3 font-serif text-md leading-normal text-text transition-colors duration-(--duration-fast) hover:border-text-muted aria-invalid:border-error'

// O tamanho é conferido antes do envio: acima do limite, o arquivo nem sai do browser (ADM-006).
// A capa pode ter até 5 MB porque é otimizada antes do envio (ADR 0041).
function clientErrors(formData: FormData, isNew: boolean): FieldErrors {
  const parsed = articleFieldsSchema.safeParse(articleFieldsFrom(formData))
  const errors = parsed.success ? {} : fieldErrorsOf(parsed.error)
  const cover = fileFrom(formData, 'cover')
  const pdf = fileFrom(formData, 'pdf')
  if (isNew && !cover) errors.cover = ARTICLE_MESSAGES.cover
  const coverTooBig = cover && coverSourceError(cover.size)
  if (coverTooBig) errors.cover = coverTooBig
  const pdfTooBig = pdf && sizeError('article-files', pdf.size)
  if (pdfTooBig) errors.content = pdfTooBig
  if (formData.get('contentType') === 'rich_text') {
    const richText = checkRichText(parseBodyField(formData.get('body')), null)
    if (!richText.ok) errors.content = richText.error
  }
  return errors
}

/** ADM-004 · Formulário de artigo; salvar = publicar (ADR 0005). */
export function ArticleForm({ initial, isNew }: { initial: ArticleFormValues; isNew: boolean }) {
  const [state, formAction, pending] = useActionState(saveArticle, null)
  const [contentType, setContentType] = useState(initial.contentType)
  const [slug, setSlug] = useState(initial.slug)
  // ADM-009 · Na criação, o slug acompanha o título até ser editado; na edição, nunca.
  const [slugEdited, setSlugEdited] = useState(!isNew)
  const [pdf, setPdf] = useState<File | null>(null)
  const [localErrors, setLocalErrors] = useState<FieldErrors | null>(null)
  const [optimizing, setOptimizing] = useState(false)
  const errors = localErrors ?? state?.fieldErrors ?? {}
  const summaryMessageId = `${initial.id}-resumo-mensagem`

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const found = clientErrors(formData, isNew)
    if (Object.keys(found).length > 0) {
      setLocalErrors(found)
      return
    }

    const cover = fileFrom(formData, 'cover')
    if (cover) {
      setOptimizing(true)
      const optimized = await optimizeCover(cover)
      setOptimizing(false)
      if (!optimized.ok) {
        setLocalErrors({ cover: optimized.error })
        return
      }
      formData.set('cover', optimized.file)
    }
    setLocalErrors(null)
    startTransition(() => formAction(formData))
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-(--layout-reading) flex-col gap-6"
    >
      <div className="flex flex-col items-start gap-4">
        <Button asChild variant="link">
          <Link href="/artigos">
            <ArrowLeft aria-hidden className="size-4" />
            Artigos
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">{isNew ? 'Novo artigo' : 'Editar artigo'}</h1>
      </div>

      {state && !localErrors && Object.keys(state.fieldErrors).length === 0 ? (
        <Alert variant="error" title={state.error} />
      ) : null}

      <div className="flex flex-col gap-6 rounded-card border border-border bg-surface p-4 shadow-card md:p-6">
        <input type="hidden" name="id" value={initial.id} />
        <TextField
          label="Título"
          name="title"
          defaultValue={initial.title}
          onChange={(event) => {
            if (!slugEdited) setSlug(slugFromTitle(event.target.value))
          }}
          error={errors.title}
        />
        <TextField
          label="Slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugEdited(true)
            setSlug(event.target.value)
          }}
          error={errors.slug}
          help={`Endereço do artigo: /artigos/${slug}. Gerado a partir do título; pode ser editado.${isNew ? '' : ' Se mudar, os links antigos continuarão funcionando.'}`}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${initial.id}-resumo`} optional>
            Resumo
          </Label>
          <textarea
            id={`${initial.id}-resumo`}
            name="summary"
            rows={3}
            defaultValue={initial.summary}
            aria-invalid={errors.summary ? true : undefined}
            aria-describedby={summaryMessageId}
            className={TEXTAREA_CLASSES}
          />
          <FieldMessage id={summaryMessageId} variant={errors.summary ? 'error' : 'help'}>
            {errors.summary ?? 'Aparece abaixo do título do artigo e no card de destaque.'}
          </FieldMessage>
        </div>
        <TextField
          label="Capa"
          name="cover"
          type="file"
          accept={IMAGE_ACCEPT}
          help="Proporção 16:9. JPG ou PNG de até 5 MB; a imagem é otimizada antes do envio."
          error={errors.cover}
        />
        <div className="flex flex-col gap-2">
          <Label id={`${initial.id}-tipo`}>Tipo</Label>
          <input type="hidden" name="contentType" value={contentType} />
          <div role="group" aria-labelledby={`${initial.id}-tipo`} className="flex gap-2">
            {CONTENT_TYPES.map((type) => (
              <Button
                key={type.value}
                size="sm"
                variant={contentType === type.value ? 'primary' : 'secondary'}
                aria-pressed={contentType === type.value}
                onClick={() => setContentType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
        <TextField
          label="Data de publicação"
          name="publishedDate"
          type="date"
          defaultValue={initial.publishedDate}
          error={errors.publishedDate}
          className="md:max-w-60"
        />
        {contentType === 'pdf' ? (
          <div className="flex flex-col gap-2">
            <TextField
              label="Arquivo PDF"
              name="pdf"
              type="file"
              accept="application/pdf"
              help="Máximo de 20 MB."
              error={errors.content}
              disabled={pending}
              onChange={(event) => setPdf(event.target.files?.[0] ?? null)}
            />
            {pending && pdf ? (
              <p role="status" className="flex items-center gap-2 text-xs text-text">
                <LoaderCircle aria-hidden className="size-4 animate-spin" />
                Enviando {pdf.name} ({formatMegabytes(pdf.size)})…
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label id={`${initial.id}-conteudo`}>Conteúdo</Label>
            <RichTextEditor
              articleId={initial.id}
              labelId={`${initial.id}-conteudo`}
              describedBy={`${initial.id}-conteudo-mensagem`}
              initialContent={initial.body}
              invalid={Boolean(errors.content)}
            />
            <FieldMessage
              id={`${initial.id}-conteudo-mensagem`}
              variant={errors.content ? 'error' : 'help'}
            >
              {errors.content ??
                'Os 3 primeiros blocos formam a prévia pública; o texto completo vai no download.'}
            </FieldMessage>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
        <Button asChild variant="secondary" className="max-md:w-full">
          <Link href="/artigos">Cancelar</Link>
        </Button>
        <Button type="submit" loading={pending || optimizing} className="max-md:w-full">
          Publicar
        </Button>
      </div>
    </form>
  )
}
