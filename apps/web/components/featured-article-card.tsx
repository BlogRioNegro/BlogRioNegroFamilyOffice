import Link from 'next/link'
import type { ArticleCardData } from '@/lib/services/articles'
import { CoverImage } from './cover-image'

// PUB-002 · Destaque: capa e texto lado a lado a partir de 768 px; empilha no mobile.
export function FeaturedArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/artigos/${article.slug}`}
      className="group grid overflow-hidden rounded-card border border-border bg-surface shadow-card transition-colors duration-(--duration-fast) hover:border-border-strong md:grid-cols-2"
    >
      <CoverImage src={article.coverUrl} eager className="md:min-h-full" />
      <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
        <time dateTime={article.publishedAt} className="text-xs text-text-muted">
          {article.dateLabel}
        </time>
        <div className="flex flex-col gap-1">
          <h2 className="font-serif font-black text-xl text-pretty wrap-anywhere underline-offset-4 group-hover:underline md:text-2xl">
            {article.title}
          </h2>
          {article.subtitle ? (
            <p className="font-serif font-regular text-lg text-pretty wrap-anywhere md:text-xl">
              {article.subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
