// PUB-012 · RSS 2.0 com os artigos mais recentes: título, link, data, descrição e capa como
// enclosure. Nunca recebe conteúdo completo, só dados públicos de `articles`.

export const FEED_SIZE = 20

export type FeedItem = {
  id: string
  title: string
  url: string
  publishedAt: string
  description: string
  coverUrl: string
}

type Feed = { title: string; siteUrl: string; feedUrl: string; description: string }

const IMAGE_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** MIME da capa pela extensão (os buckets só aceitam JPEG e PNG). */
export function imageType(url: string): string {
  const extension = new URL(url).pathname.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_TYPES[extension] ?? 'image/jpeg'
}

function renderItem(item: FeedItem): string {
  // Tamanho da capa desconhecido: o RSS 2.0 recomenda length="0" nesse caso.
  return [
    '<item>',
    `<title>${escapeXml(item.title)}</title>`,
    `<link>${escapeXml(item.url)}</link>`,
    `<guid isPermaLink="false">${escapeXml(item.id)}</guid>`,
    `<pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>`,
    `<description>${escapeXml(item.description)}</description>`,
    `<enclosure url="${escapeXml(item.coverUrl)}" length="0" type="${imageType(item.coverUrl)}"/>`,
    '</item>',
  ].join('')
}

export function buildRssFeed(feed: Feed, items: FeedItem[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapeXml(feed.title)}</title>`,
    `<link>${escapeXml(feed.siteUrl)}</link>`,
    `<description>${escapeXml(feed.description)}</description>`,
    '<language>pt-BR</language>',
    `<atom:link href="${escapeXml(feed.feedUrl)}" rel="self" type="application/rss+xml"/>`,
    ...items.slice(0, FEED_SIZE).map(renderItem),
    '</channel>',
    '</rss>',
  ].join('\n')
}
