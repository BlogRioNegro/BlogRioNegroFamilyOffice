import path from 'node:path'
import { expect, test } from '@playwright/test'
import { serviceClient } from '../integration/support/clients'
import { signInAsAdmin } from './support/admin'
import { webUrl } from './support/urls'

// ADM-004 · PUB-005 · PUB-010 · ADR 0048 · O admin preenche Título e Subtítulo, e o site mostra o
// subtítulo numa segunda linha, menor, abaixo do título. O slug continua vindo só do título.

const STORAGE = path.join(import.meta.dirname, '../../supabase/storage')
const PNG = path.join(
  STORAGE,
  'covers/11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
)
const PDF = path.join(
  STORAGE,
  'article-previews/22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf',
)
const BUCKETS = ['covers', 'article-files', 'article-previews'] as const

const stamp = Date.now()
const TITLE = `O que moveu o mercado ${stamp}`
const SLUG = `o-que-moveu-o-mercado-${stamp}`
const SUBTITLE = '21 a 25 de setembro'

let articleId = ''

test.afterAll(async () => {
  if (!articleId) return
  const service = serviceClient()
  await service.from('articles').delete().eq('id', articleId)
  for (const bucket of BUCKETS) {
    const { data } = await service.storage.from(bucket).list(articleId)
    const paths = (data ?? []).map((file) => `${articleId}/${file.name}`)
    if (paths.length > 0) await service.storage.from(bucket).remove(paths)
  }
})

test('criar artigo com subtítulo no admin e ver as duas linhas no site', async ({ page }) => {
  test.setTimeout(90_000)
  await signInAsAdmin(page)

  await page.goto('/artigos/novo')
  articleId = await page.locator('input[name="id"]').inputValue()
  await page.getByLabel('Título', { exact: true }).fill(TITLE)
  const subtitleField = page.getByLabel('Subtítulo (opcional)')
  await expect(
    page.getByText('Aparece numa segunda linha, menor, abaixo do título. Ex.: 21 a 25 de setembro'),
  ).toBeVisible()
  await subtitleField.fill(`  ${SUBTITLE}  `)
  // O slug nasce só do título.
  await expect(page.getByLabel('Slug')).toHaveValue(SLUG)
  await page.getByLabel('Capa').setInputFiles(PNG)
  await page.getByLabel('Arquivo PDF').setInputFiles(PDF)
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page).toHaveURL(/\/artigos$/)

  // Lista do admin: subtítulo abaixo do título, em texto secundário.
  const row = page.getByRole('row').filter({ hasText: TITLE })
  await expect(row.getByText(SUBTITLE, { exact: true })).toBeVisible()

  // Edição: o campo volta preenchido (e aparado).
  await row.getByRole('link', { name: 'Editar' }).click()
  await expect(page.getByLabel('Subtítulo (opcional)')).toHaveValue(SUBTITLE)

  // Página do artigo: <h1> e, logo abaixo, o subtítulo num <p> menor, em Roboto Slab Regular.
  await page.goto(webUrl(`/artigos/${SLUG}`))
  const main = page.getByRole('main')
  const title = main.getByRole('heading', { level: 1 })
  await expect(title).toHaveText(TITLE)
  const subtitle = main.locator('h1 + p')
  await expect(subtitle).toHaveText(SUBTITLE)
  await expect(subtitle).toHaveCSS('font-weight', '400')
  await expect(subtitle).toHaveCSS('font-family', /Roboto Slab/)
  await expect(subtitle).toHaveCSS('font-size', '30px')
  await expect(title).toHaveCSS('font-size', '36px')
  const titleBox = await title.boundingBox()
  const subtitleBox = await subtitle.boundingBox()
  expect(subtitleBox?.y).toBeGreaterThanOrEqual((titleBox?.y ?? 0) + (titleBox?.height ?? 0))
  await expect(page).toHaveTitle(`${TITLE}: ${SUBTITLE} · Blog Rio Negro Family Office`)

  // Listagem: é o mais recente, então aparece no card de destaque, com o subtítulo abaixo do título.
  await page.goto(webUrl('/artigos'))
  const featured = page.getByRole('main').getByRole('link', { name: new RegExp(TITLE) })
  await expect(featured.getByRole('heading', { level: 2 })).toHaveText(TITLE)
  await expect(featured.locator('h2 + p')).toHaveText(SUBTITLE)
  await expect(featured.locator('h2 + p')).toHaveCSS('font-size', '24px')
})

test('no celular, o subtítulo do artigo tem 24 px sob o H1 de 28 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(webUrl('/artigos/carteira-recomendada-outubro'))

  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1 })).toHaveCSS('font-size', '28px')
  await expect(main.locator('h1 + p')).toHaveText('Perfis conservador, moderado e arrojado')
  await expect(main.locator('h1 + p')).toHaveCSS('font-size', '24px')
})

test('artigo sem subtítulo não ganha a segunda linha', async ({ page }) => {
  await page.goto(webUrl('/artigos/guia-de-previdencia-privada'))

  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(main.locator('h1 + p')).toHaveCount(0)
  await expect(page).toHaveTitle(
    'Guia de previdência privada: PGBL ou VGBL? · Blog Rio Negro Family Office',
  )
})
