import { Button, cn, TypeBadge } from '@rio-negro/ui'
import { ArrowLeft } from '@rio-negro/ui/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CoverImage } from '@/components/cover-image'
import { LeadDialog } from '@/components/lead-dialog'
import { PdfPreview } from '@/components/pdf-preview'
import { RichText } from '@/components/rich-text'
import { articleDescription } from '@/lib/domain/article-description'
import { formatPublishedDate } from '@/lib/domain/published-date'
import { parseRichTextPreview } from '@/lib/domain/rich-text'
import { env } from '@/lib/env'
import { coverUrl, getArticleBySlug, previewPdfUrl } from '@/lib/services/articles'

// PUB-010 · Descrição com fallback (articleDescription); capa como og:image absoluta.
export async function generateMetadata({
  params,
}: PageProps<'/artigos/[slug]'>): Promise<Metadata> {
  const article = await getArticleBySlug((await params).slug)
  if (!article) return {}

  const url = `/artigos/${article.slug}`
  const description = articleDescription(article)
  const image = coverUrl(article.cover_path)

  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description,
      images: [image],
      publishedTime: article.published_at,
    },
    twitter: { card: 'summary_large_image', title: article.title, description, images: [image] },
  }
}

// PUB-005 · Só dados públicos e a prévia (ADR 0007); o conteúdo completo nunca é lido aqui.
export default async function ArticlePage({ params }: PageProps<'/artigos/[slug]'>) {
  const article = await getArticleBySlug((await params).slug)
  if (!article) notFound()

  return (
    <main className="mx-auto flex w-full max-w-(--layout-reading) flex-1 flex-col px-4 pt-6 pb-16 md:px-0 md:pt-12 md:pb-24">
      <div>
        <Button asChild variant="link">
          <Link href="/artigos">
            <ArrowLeft aria-hidden className="size-5" />
            Todos os artigos
          </Link>
        </Button>
      </div>
      <h1 className="my-6 text-3xl font-bold text-balance md:my-8 md:text-4xl">{article.title}</h1>
      <CoverImage src={coverUrl(article.cover_path)} eager className="rounded-card" />
      <div className="mt-4 mb-3 flex items-center gap-2 text-xs text-text-muted md:mt-6 md:mb-4">
        <TypeBadge type={article.content_type} />
        <time dateTime={article.published_at}>{formatPublishedDate(article.published_at)}</time>
      </div>
      {article.summary ? (
        <p className="mb-6 font-serif text-lg leading-snug text-pretty text-text-muted md:mb-8 md:text-xl">
          {article.summary}
        </p>
      ) : null}
      {article.content_type === 'rich_text' ? (
        <RichText blocks={parseRichTextPreview(article.preview_json)} />
      ) : null}
      {article.content_type === 'pdf' && article.preview_pdf_path ? (
        <PdfPreview src={previewPdfUrl(article.preview_pdf_path)} />
      ) : null}
      <div
        className={cn(
          'flex flex-col gap-4 border-t border-border pt-6 md:items-start md:pt-8',
          article.content_type === 'rich_text' ? 'mt-2 md:mt-4' : 'mt-6 md:mt-8',
        )}
      >
        <p className="text-text-muted">
          Esta é uma prévia. O artigo completo está disponível para download.
        </p>
        <LeadDialog
          article={{
            id: article.id,
            title: article.title,
            format: article.content_type === 'pdf' ? 'PDF' : 'Texto',
          }}
          turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          rioNegroUrl={env.NEXT_PUBLIC_RIO_NEGRO_URL}
        />
      </div>
    </main>
  )
}
