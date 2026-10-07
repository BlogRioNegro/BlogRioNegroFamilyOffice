import { expect, test, type Locator, type Page } from '@playwright/test'
import { executeLocalSql } from '../integration/support/local-supabase'
import { signInAsAdmin } from './support/admin'
import { webUrl } from './support/urls'

// DS-003 · Títulos em Roboto Slab Black, sem maiúsculas forçadas nem espaçamento entre letras, com o
// H1 em 36 px (28 px no celular) e nenhum outro título maior ou igual a ele (ADR 0047).

const MOBILE = { width: 390, height: 844 }
const DESKTOP = { width: 1280, height: 800 }

const id = 'bbbbbbbb-0000-4000-8000-000000000047'
const SLUG = 'titulo-longo-ds-003'
// 60 caracteres, com uma palavra de 20 letras.
const LONG_TITLE = 'Juros sobem desproporcionalmente e pressionam a renda mensal'
const SECTION_TITLE = 'Cenário desproporcionalmente incerto'

test.beforeAll(() => {
  const preview = JSON.stringify({
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: SECTION_TITLE }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Texto da prévia.' }] },
    ],
  })
  // Publicado no futuro: é o destaque da listagem enquanto o teste roda.
  executeLocalSql(`with a as (
    insert into public.articles (id, slug, title, cover_path, content_type, preview_json, published_at)
    values ('${id}', '${SLUG}', '${LONG_TITLE}', 'x/capa.png', 'rich_text', '${preview}',
      now() + interval '1 day')
    returning id
  ) insert into public.article_contents (article_id, body_json, full_pdf_path)
    select id, '${preview}', 'x/completo.pdf' from a`)
})

test.afterAll(() => {
  executeLocalSql(`delete from public.articles where id = '${id}'`)
})

async function expectTitleStyle(title: Locator, fontSize: string) {
  await expect(title).toHaveCSS('font-size', fontSize)
  await expect(title).toHaveCSS('font-weight', '900')
  await expect(title).toHaveCSS('text-transform', 'none')
  await expect(title).toHaveCSS('letter-spacing', 'normal')
  await expect(title).toHaveCSS('font-family', /Roboto Slab/)
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
}

async function fontSizes(titles: Locator): Promise<number[]> {
  return titles.evaluateAll((elements) =>
    elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
  )
}

test('o título do tipo tem 60 caracteres e uma palavra de 20 letras', () => {
  expect(LONG_TITLE).toHaveLength(60)
  expect(LONG_TITLE.split(' ').some((word) => word.length === 20)).toBe(true)
})

for (const { name, viewport, h1, lineHeight } of [
  { name: 'celular (390 px)', viewport: MOBILE, h1: '28px', lineHeight: '33.6px' },
  { name: 'desktop (1280 px)', viewport: DESKTOP, h1: '36px', lineHeight: '43.2px' },
]) {
  test.describe(name, () => {
    test.use({ viewport })

    test('H1 do hero da home', async ({ page }) => {
      await page.goto(webUrl('/'))

      await expectTitleStyle(page.getByRole('heading', { level: 1 }), h1)
      await expectNoHorizontalOverflow(page)
    })

    test('H1 e título de seção do artigo, com título longo', async ({ page }) => {
      await page.goto(webUrl(`/artigos/${SLUG}`))

      const main = page.getByRole('main')
      const title = main.getByRole('heading', { level: 1, name: LONG_TITLE })
      await expectTitleStyle(title, h1)
      await expect(title).toHaveCSS('line-height', lineHeight)
      await expectTitleStyle(main.getByRole('heading', { level: 2, name: SECTION_TITLE }), '24px')
      await expectNoHorizontalOverflow(page)
    })

    test('na listagem, nenhum título de card alcança o H1', async ({ page }) => {
      await page.goto(webUrl('/artigos'))

      const main = page.getByRole('main')
      await expectTitleStyle(main.getByRole('heading', { level: 1, name: 'Artigos' }), h1)
      const cards = main.getByRole('heading', { level: 2 })
      await expect(cards.first()).toHaveText(LONG_TITLE)
      await expectTitleStyle(cards.first(), viewport === MOBILE ? '24px' : '30px')
      await expectTitleStyle(cards.nth(1), '18px')
      for (const size of await fontSizes(cards)) {
        expect(size).toBeLessThan(Number.parseFloat(h1))
      }
      await expectNoHorizontalOverflow(page)
    })

    test('H1 de /privacidade e do 404, com os títulos de seção menores', async ({ page }) => {
      await page.goto(webUrl('/privacidade'))
      const main = page.getByRole('main')
      await expectTitleStyle(main.getByRole('heading', { level: 1 }), h1)
      await expectTitleStyle(main.getByRole('heading', { level: 2 }).first(), '24px')
      await expectNoHorizontalOverflow(page)

      await page.goto(webUrl('/pagina-que-nao-existe'))
      await expectTitleStyle(page.getByRole('main').getByRole('heading', { level: 1 }), h1)
    })

    test('H1 do login e da lista de artigos do admin', async ({ page }) => {
      await page.goto('/login')
      await expectTitleStyle(page.getByRole('heading', { level: 1, name: 'Entrar no painel' }), h1)
      await expectNoHorizontalOverflow(page)

      await signInAsAdmin(page)
      await expectTitleStyle(page.getByRole('heading', { level: 1, name: 'Artigos' }), h1)
      await expect(page.getByText(LONG_TITLE).filter({ visible: true })).toHaveCount(1)
      await expectNoHorizontalOverflow(page)
    })
  })
}

test('o título do Dialog é Black, menor que o H1 e sem maiúsculas forçadas', async ({ page }) => {
  await page.setViewportSize(MOBILE)
  await page.goto(webUrl(`/artigos/${SLUG}`))
  await page.getByRole('button', { name: 'Baixar artigo completo' }).click()

  await expectTitleStyle(page.getByRole('dialog').getByRole('heading'), '24px')
})
