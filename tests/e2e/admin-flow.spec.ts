import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { serviceClient } from '../integration/support/clients'
import { signInAsAdmin } from './support/admin'
import { webUrl } from './support/urls'

// ADM-001 · Fluxo completo do painel: login, criar artigo pdf e rich_text, editar o slug (o antigo
// responde 301 no site) e excluir, sem sobrar arquivo no Storage.

const STORAGE = path.join(import.meta.dirname, '../../supabase/storage')
const PNG = path.join(
  STORAGE,
  'covers/11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
)
const PDF = path.join(
  STORAGE,
  'article-previews/22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf',
)
const BUCKETS = ['covers', 'article-images', 'article-files', 'article-previews'] as const

const stamp = Date.now()
const PDF_ARTICLE = { title: `Fluxo E2E PDF ${stamp}`, slug: `fluxo-e2e-pdf-${stamp}` }
const TEXT_ARTICLE = { title: `Fluxo E2E Texto ${stamp}`, slug: `fluxo-e2e-texto-${stamp}` }
const NEW_SLUG = `fluxo-e2e-slug-novo-${stamp}`

const created: string[] = []

async function filesOf(id: string) {
  const service = serviceClient()
  const lists = await Promise.all(BUCKETS.map((bucket) => service.storage.from(bucket).list(id)))
  return lists.flatMap(({ data }) => data ?? [])
}

async function startArticle(page: Page, title: string) {
  await page.goto('/artigos/novo')
  created.push(await page.locator('input[name="id"]').inputValue())
  await page.getByLabel('Título').fill(title)
  await page.getByLabel('Capa').setInputFiles(PNG)
}

async function deleteFromList(page: Page, title: string) {
  await page.goto('/artigos')
  const row = page.getByRole('row').filter({ hasText: title })
  await row.getByRole('button', { name: 'Excluir' }).click()
  await page
    .getByRole('dialog', { name: 'Excluir artigo?' })
    .getByRole('button', { name: 'Excluir artigo' })
    .click()
  await expect(row).toHaveCount(0)
}

test.afterAll(async () => {
  const service = serviceClient()
  await service.from('articles').delete().in('id', created)
  for (const id of created) {
    for (const bucket of BUCKETS) {
      const { data } = await service.storage.from(bucket).list(id)
      const paths = (data ?? []).map((file) => `${id}/${file.name}`)
      if (paths.length > 0) await service.storage.from(bucket).remove(paths)
    }
  }
})

test('login → criar pdf e texto → editar slug (301) → excluir', async ({ page, request }) => {
  test.setTimeout(120_000)
  await signInAsAdmin(page)

  // Criar artigo PDF: o slug nasce do título.
  await startArticle(page, PDF_ARTICLE.title)
  await expect(page.getByLabel('Slug')).toHaveValue(PDF_ARTICLE.slug)
  await page.getByLabel('Arquivo PDF').setInputFiles(PDF)
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page).toHaveURL(/\/artigos$/)
  await expect(page.getByRole('row').filter({ hasText: PDF_ARTICLE.title })).toBeVisible()

  // Criar artigo Texto.
  await startArticle(page, TEXT_ARTICLE.title)
  await page.getByRole('group', { name: 'Tipo' }).getByRole('button', { name: 'Texto' }).click()
  await page.getByRole('textbox', { name: 'Conteúdo' }).click()
  await page.keyboard.type('Primeiro bloco do fluxo.')
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page).toHaveURL(/\/artigos$/)
  await page.goto(webUrl(`/artigos/${TEXT_ARTICLE.slug}`))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(TEXT_ARTICLE.title)

  // Editar o slug do PDF: aviso de links antigos, e o antigo responde 301 para o novo.
  await page.goto('/artigos')
  await page
    .getByRole('row')
    .filter({ hasText: PDF_ARTICLE.title })
    .getByRole('link', { name: 'Editar' })
    .click()
  await expect(page.getByText('Se mudar, os links antigos continuarão funcionando.')).toBeVisible()
  await page.getByLabel('Título').fill(`${PDF_ARTICLE.title} editado`)
  await expect(page.getByLabel('Slug')).toHaveValue(PDF_ARTICLE.slug)
  await page.getByLabel('Slug').fill(NEW_SLUG)
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page).toHaveURL(/\/artigos$/)

  const old = await request.get(webUrl(`/artigos/${PDF_ARTICLE.slug}`), { maxRedirects: 0 })
  expect(old.status()).toBe(301)
  expect(new URL(old.headers().location ?? '', webUrl('/')).pathname).toBe(`/artigos/${NEW_SLUG}`)
  await page.goto(webUrl(`/artigos/${PDF_ARTICLE.slug}`))
  await expect(page).toHaveURL(webUrl(`/artigos/${NEW_SLUG}`))

  // Slug em uso por outro artigo (o texto) é rejeitado no campo.
  await page.goto('/artigos')
  await page
    .getByRole('row')
    .filter({ hasText: TEXT_ARTICLE.title })
    .getByRole('link', { name: 'Editar' })
    .click()
  await page.getByLabel('Slug').fill(PDF_ARTICLE.slug)
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(
    page.getByText('Este slug já é (ou já foi) usado por outro artigo. Escolha outro.'),
  ).toBeVisible()

  // Excluir os dois: somem do site e do Storage.
  await deleteFromList(page, `${PDF_ARTICLE.title} editado`)
  await deleteFromList(page, TEXT_ARTICLE.title)
  const gone = await request.get(webUrl(`/artigos/${NEW_SLUG}`), { maxRedirects: 0 })
  expect(gone.status()).toBe(404)
  for (const id of created) expect(await filesOf(id)).toEqual([])
})
