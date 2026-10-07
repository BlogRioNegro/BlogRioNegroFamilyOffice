import Link from 'next/link'
import type { ArticleCardData } from '@/lib/services/articles'
import { CoverImage } from './cover-image'

// PUB-003 · O card inteiro é o link: capa, data, título (até 3 linhas) e subtítulo, se houver.
export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/artigos/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-colors duration-(--duration-fast) hover:border-border-strong"
    >
      <CoverImage src={article.coverUrl} />
      <div className="flex flex-col gap-2 p-4">
        <time dateTime={article.publishedAt} className="text-xs text-text-muted">
          {article.dateLabel}
        </time>
        <div className="flex flex-col gap-1">
          <h2 className="line-clamp-3 font-serif font-black text-md leading-snug text-pretty wrap-anywhere underline-offset-4 group-hover:underline">
            {article.title}
          </h2>
          {article.subtitle ? (
            <p className="font-serif font-regular text-sm text-pretty wrap-anywhere">
              {article.subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
