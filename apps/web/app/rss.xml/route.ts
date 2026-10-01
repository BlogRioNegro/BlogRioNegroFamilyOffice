import { connection } from 'next/server'
import { articleDescription, BLOG_DESCRIPTION } from '@/lib/domain/article-description'
import { buildRssFeed, FEED_SIZE } from '@/lib/domain/rss'
import { env } from '@/lib/env'
import { coverUrl, listFeedArticles } from '@/lib/services/articles'

// PUB-012 · Feed RSS 2.0 dinâmico (ADR 0003), só com dados públicos (ADR 0007).
export async function GET() {
  await connection()
  const site = env.NEXT_PUBLIC_SITE_URL
  const articles = await listFeedArticles(FEED_SIZE)

  const xml = buildRssFeed(
    {
      title: 'Rio Negro Investimentos',
      siteUrl: new URL('/', site).href,
      feedUrl: new URL('/rss.xml', site).href,
      description: BLOG_DESCRIPTION,
    },
    articles.map((article) => ({
      id: article.id,
      title: article.title,
      url: new URL(`/artigos/${article.slug}`, site).href,
      publishedAt: article.published_at,
      description: articleDescription(article),
      coverUrl: coverUrl(article.cover_path),
    })),
  )

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
