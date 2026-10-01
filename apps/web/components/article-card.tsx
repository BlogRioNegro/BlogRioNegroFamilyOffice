import Link from 'next/link'
import type { ArticleCardData } from '@/lib/services/articles'
import { CoverImage } from './cover-image'

// PUB-003 · O card inteiro é o link: capa, data e título (até 3 linhas).
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
        <h2 className="line-clamp-3 text-md leading-snug font-semibold text-pretty underline-offset-4 group-hover:underline">
          {article.title}
        </h2>
      </div>
    </Link>
  )
}
