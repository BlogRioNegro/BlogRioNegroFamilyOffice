import { describe, expect, it } from 'vitest'
import { buildRssFeed, FEED_SIZE, imageType, type FeedItem } from './rss'

const feed = {
  title: 'Rio Negro Investimentos',
  siteUrl: 'https://blog.example/',
  feedUrl: 'https://blog.example/rss.xml',
  description: 'Descrição do blog',
}

function item(index: number, overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    id: `id-${index}`,
    title: `Artigo ${index}`,
    url: `https://blog.example/artigos/artigo-${index}`,
    publishedAt: '2026-09-25T12:00:00Z',
    description: `Resumo ${index}`,
    coverUrl: `https://cdn.example/covers/${index}.png`,
    ...overrides,
  }
}

describe('buildRssFeed', () => {
  it('monta o canal RSS 2.0 com link self', () => {
    const xml = buildRssFeed(feed, [])

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">')
    expect(xml).toContain('<title>Rio Negro Investimentos</title>')
    expect(xml).toContain('<link>https://blog.example/</link>')
    expect(xml).toContain(
      '<atom:link href="https://blog.example/rss.xml" rel="self" type="application/rss+xml"/>',
    )
  })

  it('cada item traz título, link, guid, data RFC 822, descrição e capa como enclosure', () => {
    const xml = buildRssFeed(feed, [item(1)])

    expect(xml).toContain(
      '<item><title>Artigo 1</title><link>https://blog.example/artigos/artigo-1</link>' +
        '<guid isPermaLink="false">id-1</guid><pubDate>Fri, 25 Sep 2026 12:00:00 GMT</pubDate>' +
        '<description>Resumo 1</description>' +
        '<enclosure url="https://cdn.example/covers/1.png" length="0" type="image/png"/></item>',
    )
  })

  it('escapa caracteres especiais de XML', () => {
    const xml = buildRssFeed(feed, [
      item(1, { title: 'Renda <fixa> & "juros"', description: "D'Ávila" }),
    ])

    expect(xml).toContain('<title>Renda &lt;fixa&gt; &amp; &quot;juros&quot;</title>')
    expect(xml).toContain('<description>D&apos;Ávila</description>')
  })

  it(`limita o feed a ${FEED_SIZE} itens`, () => {
    const items = Array.from({ length: FEED_SIZE + 5 }, (_, index) => item(index))

    expect(buildRssFeed(feed, items).match(/<item>/g)).toHaveLength(FEED_SIZE)
  })
})

describe('imageType', () => {
  it.each([
    ['https://cdn.example/a.jpg', 'image/jpeg'],
    ['https://cdn.example/a.JPEG', 'image/jpeg'],
    ['https://cdn.example/a.png', 'image/png'],
  ])('%s → %s', (url, type) => {
    expect(imageType(url)).toBe(type)
  })
})
