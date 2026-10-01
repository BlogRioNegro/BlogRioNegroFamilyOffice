import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { adminClient, serviceClient } from '../integration/support/clients'
import { signInAsAdmin } from './support/admin'

// ADM-003 · Lista de artigos do admin (seed: 3 artigos, o mais recente é o guia de previdência).

test('lista os artigos na ordem do site com o destaque e o nº de leads', async ({ page }) => {
  await signInAsAdmin(page)

  const table = page.getByRole('table', { name: 'Artigos publicados' })
  const rows = table.getByRole('row')
  await expect(rows).toHaveCount(4)
  await expect(rows.nth(1)).toContainText('Guia de previdência privada: PGBL ou VGBL?')
  await expect(rows.nth(1)).toContainText('Em destaque')
  await expect(rows.nth(2)).not.toContainText('Em destaque')
  await expect(
    page.getByText('3 publicados · o mais recente aparece em destaque no site'),
  ).toBeVisible()
  await expect(rows.nth(1).getByRole('link', { name: 'Editar' })).toBeVisible()
  await expect(rows.nth(1).getByRole('link', { name: 'Ver leads' })).toBeVisible()
})

test('no mobile, as ações do artigo abrem num Dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await signInAsAdmin(page)

  const cards = page.getByRole('list', { name: 'Artigos publicados' }).getByRole('listitem')
  await expect(cards).toHaveCount(3)
  await cards.first().getByRole('button', { name: 'Ações' }).click()

  const dialog = page.getByRole('dialog', { name: 'Ações do artigo' })
  await expect(dialog.getByRole('link', { name: 'Editar' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

// Artigo descartável, mais antigo que o seed (fica no fim da lista), criado pelo save_article.
async function createThrowawayArticle(title: string) {
  const id = randomUUID()
  const { error } = await (
    await adminClient()
  ).rpc('save_article', {
    article_id: id,
    slug: `descartavel-${id}`,
    title,
    cover_path: `${id}/capa.png`,
    content_type: 'pdf',
    published_at: '2020-01-01T12:00:00Z',
    full_pdf_path: `${id}/completo.pdf`,
    preview_pdf_path: `${id}/previa.pdf`,
  })
  if (error) throw error
  return id
}

test('ADM-012 · excluir pede confirmação; Cancelar mantém e confirmar remove', async ({ page }) => {
  const title = 'Artigo descartável do E2E'
  const id = await createThrowawayArticle(title)
  try {
    await signInAsAdmin(page)
    const row = page.getByRole('row').filter({ hasText: title })

    await row.getByRole('button', { name: 'Excluir' }).click()
    const dialog = page.getByRole('dialog', { name: 'Excluir artigo?' })
    await expect(dialog).toContainText(
      `“${title}” será removido do site. Esta ação não pode ser desfeita.`,
    )
    await dialog.getByRole('button', { name: 'Cancelar' }).click()
    await expect(dialog).toBeHidden()
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: 'Excluir' }).click()
    await dialog.getByRole('button', { name: 'Excluir artigo' }).click()
    await expect(dialog).toBeHidden()
    await expect(row).toHaveCount(0)
    await expect(page.getByText('3 publicados')).toBeVisible()
  } finally {
    await serviceClient().from('articles').delete().eq('id', id)
  }
})

// Fidelidade visual (spec 05, UI): só com VISUAL=1. Salva o app e o protótipo em __visual__.
test.describe('Visual · Artigos', () => {
  test.skip(!process.env.VISUAL, 'Gerado só com VISUAL=1')

  const OUT = path.join(import.meta.dirname, '__visual__')
  const PROTOTYPE = pathToFileURL(
    path.join(import.meta.dirname, '../../design/prototipo/Admin.dc.html'),
  ).href
  const SIZES = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 },
  } as const

  for (const [device, viewport] of Object.entries(SIZES)) {
    test(device, async ({ browser }) => {
      const prototype = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
      await prototype.goto(PROTOTYPE, { waitUntil: 'networkidle' })
      await prototype
        .locator(`[data-screen-label="Artigos · lista · ${device}"] > div`)
        .first()
        .screenshot({ path: path.join(OUT, `admin-artigos-${device}-prototipo.png`) })
      await prototype.close()

      const page = await browser.newPage({ viewport })
      await signInAsAdmin(page)
      await page.mouse.move(0, 0)
      await page.screenshot({
        path: path.join(OUT, `admin-artigos-${device}-app.png`),
        fullPage: true,
      })
      await page.close()
    })

    test(`${device} · confirmar exclusão`, async ({ browser }) => {
      const prototype = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
      await prototype.goto(PROTOTYPE, { waitUntil: 'networkidle' })
      await prototype
        .locator(`[data-screen-label="Artigos · confirmar exclusão · ${device}"] > div`)
        .first()
        .screenshot({ path: path.join(OUT, `admin-artigos-excluir-${device}-prototipo.png`) })
      await prototype.close()

      const page = await browser.newPage({ viewport })
      await signInAsAdmin(page)
      if (device === 'mobile') {
        await page.getByRole('button', { name: 'Ações' }).first().click()
        await page
          .getByRole('dialog', { name: 'Ações do artigo' })
          .getByRole('button', { name: 'Excluir' })
          .click()
      } else {
        await page.getByRole('button', { name: 'Excluir' }).first().click()
      }
      await expect(page.getByRole('dialog', { name: 'Excluir artigo?' })).toBeVisible()
      await page.screenshot({ path: path.join(OUT, `admin-artigos-excluir-${device}-app.png`) })
      await page.close()
    })
  }

  test('mobile · menu de ações', async ({ browser }) => {
    const prototype = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
    await prototype.goto(PROTOTYPE, { waitUntil: 'networkidle' })
    await prototype
      .locator('[data-screen-label="Artigos · menu de ações · mobile"] > div')
      .first()
      .screenshot({ path: path.join(OUT, 'admin-artigos-acoes-mobile-prototipo.png') })
    await prototype.close()

    const page = await browser.newPage({ viewport: SIZES.mobile })
    await signInAsAdmin(page)
    await page.getByRole('button', { name: 'Ações' }).first().click()
    await expect(page.getByRole('dialog', { name: 'Ações do artigo' })).toBeVisible()
    await page.screenshot({ path: path.join(OUT, 'admin-artigos-acoes-mobile-app.png') })
    await page.close()
  })
})
