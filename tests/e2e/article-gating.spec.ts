import { expect, test, type APIRequestContext } from '@playwright/test'
import { queryLocalDb } from '../integration/support/local-supabase'
import { webUrl } from './support/urls'

// PUB-005 · ADR 0007: o HTML e o payload RSC da página do artigo não trazem nada além da prévia.
// Compara com o conteúdo completo (article_contents) dos artigos do seed.

type SeedArticle = { slug: string; preview: string; body: string; fullPdfPath: string }

function readSeedArticle(slug: string): SeedArticle {
  const [row] = queryLocalDb(`select a.slug, coalesce(a.preview_json::text, '') as preview,
      coalesce(c.body_json::text, '') as body, c.full_pdf_path
    from public.articles a join public.article_contents c on c.article_id = a.id
    where a.slug = '${slug}'`)
  if (!row) throw new Error(`Artigo ${slug} não está no seed`)
  return {
    slug: String(row.slug),
    preview: String(row.preview),
    body: String(row.body),
    fullPdfPath: String(row.full_pdf_path),
  }
}

/** Textos do conteúdo completo que não estão na prévia pública. */
function fullOnlyTexts(article: SeedArticle): string[] {
  const texts = [...article.body.matchAll(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map((match) =>
    JSON.parse(`"${match[1]}"`),
  )
  return texts.filter((text: string) => !article.preview.includes(text))
}

async function fetchVariants(request: APIRequestContext, slug: string) {
  const url = webUrl(`/artigos/${slug}`)
  const html = await (await request.get(url)).text()
  const rsc = await request.get(url, { headers: { RSC: '1' } })
  expect(rsc.headers()['content-type']).toContain('text/x-component')
  return { html, rsc: await rsc.text() }
}

test.describe('F4-017 · PUB-005 · conteúdo completo nunca sai na página do artigo', () => {
  test('rich_text: HTML e RSC têm a prévia e nenhum texto exclusivo do conteúdo completo', async ({
    request,
  }) => {
    const article = readSeedArticle('renda-fixa-em-2026')
    const hidden = fullOnlyTexts(article)
    expect(hidden).toContain('Texto completo de exemplo, disponível só após o cadastro.')

    const { html, rsc } = await fetchVariants(request, article.slug)

    for (const payload of [html, rsc]) {
      expect(payload).toContain('Com a nova trajetória da Selic')
      for (const text of hidden) expect(payload).not.toContain(text)
      expect(payload).not.toContain(article.fullPdfPath)
      expect(payload).not.toContain('article-files')
    }
  })

  test('pdf: HTML e RSC não citam o PDF completo nem o bucket privado', async ({ request }) => {
    const article = readSeedArticle('carteira-recomendada-outubro')

    const { html, rsc } = await fetchVariants(request, article.slug)

    for (const payload of [html, rsc]) {
      expect(payload).toContain('article-previews')
      expect(payload).not.toContain(article.fullPdfPath)
      expect(payload).not.toContain('article-files')
    }
  })

  test('navegação client-side: nenhum payload RSC traz o conteúdo completo', async ({ page }) => {
    const article = readSeedArticle('renda-fixa-em-2026')
    const hidden = fullOnlyTexts(article)
    const payloads: Promise<string>[] = []
    page.on('response', (response) => {
      if (response.headers()['content-type']?.includes('text/x-component')) {
        payloads.push(response.text())
      }
    })

    await page.goto(webUrl('/artigos'))
    await page.getByRole('link', { name: /Renda fixa em 2026/ }).click()
    await expect(page).toHaveURL(webUrl(`/artigos/${article.slug}`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Renda fixa em 2026: o que muda para o investidor',
    )

    const bodies = await Promise.all(payloads)
    expect(bodies.length).toBeGreaterThan(0)
    for (const body of bodies) {
      for (const text of hidden) expect(body).not.toContain(text)
      expect(body).not.toContain(article.fullPdfPath)
    }
  })
})
