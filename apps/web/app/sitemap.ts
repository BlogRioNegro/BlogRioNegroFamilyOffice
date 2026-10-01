import type { MetadataRoute } from 'next'
import { connection } from 'next/server'
import { env } from '@/lib/env'
import { listArticleSlugs } from '@/lib/services/articles'

// PUB-011 · Home, listagem e os slugs atuais (slugs antigos só existem no histórico e redirecionam).
// Dinâmico como as demais rotas de artigos (ADR 0003).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection()
  const site = env.NEXT_PUBLIC_SITE_URL
  const articles = await listArticleSlugs()

  return [
    { url: new URL('/', site).href },
    { url: new URL('/artigos', site).href },
    ...articles.map((article) => ({
      url: new URL(`/artigos/${article.slug}`, site).href,
      lastModified: article.updated_at,
    })),
  ]
}
