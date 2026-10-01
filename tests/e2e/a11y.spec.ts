import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { serviceClient } from '../integration/support/clients'
import { executeLocalSql } from '../integration/support/local-supabase'
import { TURNSTILE_FAIL_WEB_URL, webUrl } from './support/urls'

// DS-006 · F7-004 · Auditoria axe (WCAG 2.0/2.1 A e AA) nas telas públicas e em cada estado do
// modal de lead, a 1440 e 390 px. Só roda com A11Y=1: enquanto houver violações, não quebra a
// suíte. Os resultados vão para docs/revisao-final.md.

test.skip(!process.env.A11Y, 'Auditoria só com A11Y=1')

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const SIZES = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const

const ARTICLE = {
  id: '22222222-2222-4222-8222-222222222222',
  path: '/artigos/carteira-recomendada-outubro',
}
// PDF completo do artigo do seed, que o seed não envia ao Storage (igual ao lead-capture.spec.ts).
const FULL_PDF_PATH = `${ARTICLE.id}/b1b2c3d4-0000-4000-8000-000000000003.pdf`

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'listagem', path: '/artigos' },
  { name: 'artigo pdf', path: ARTICLE.path },
  { name: 'artigo rich_text', path: '/artigos/renda-fixa-em-2026' },
  { name: 'privacidade', path: '/privacidade' },
  { name: '404', path: '/artigos/nao-existe-a11y' },
]

/** Violações em formato legível: regra (impacto) ×nós: seletores. */
async function audit(page: Page, include?: string) {
  const builder = new AxeBuilder({ page }).withTags(TAGS)
  const { violations } = await (include ? builder.include(include) : builder).analyze()
  return violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}) ×${violation.nodes.length}: ${violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(' '))
        .join(' | ')}`,
  )
}

async function openModal(page: Page, base?: string) {
  await page.goto(base ? new URL(ARTICLE.path, base).href : webUrl(ARTICLE.path))
  await page.getByRole('button', { name: 'Baixar artigo completo' }).click()
  const dialog = page.getByRole('dialog', { name: 'Baixe o artigo completo' })
  await expect(dialog).toBeVisible()
  return dialog
}

async function fillValid(dialog: Locator) {
  await dialog.getByLabel('Nome', { exact: true }).fill('Pessoa A11y')
  await dialog.getByLabel('E-mail', { exact: true }).fill('a11y.e2e@exemplo.com.br')
  await dialog.getByLabel('Telefone', { exact: true }).fill('11987654321')
  await dialog.getByRole('checkbox', { name: 'Li e concordo com o aviso de privacidade.' }).click()
  await expect(dialog.locator('input[name="cf-turnstile-response"]')).not.toHaveValue('')
}

async function clearLeads() {
  const service = serviceClient()
  await service.from('leads').delete().eq('article_id', ARTICLE.id)
  await service.from('lead_rate_limits').delete().neq('key', '')
}

test.beforeAll(async () => {
  const { error } = await serviceClient()
    .storage.from('article-files')
    .upload(FULL_PDF_PATH, new Blob(['%PDF-1.4 completo a11y'], { type: 'application/pdf' }), {
      upsert: true,
    })
  if (error) throw error
})

test.afterAll(async () => {
  await clearLeads()
  await serviceClient().storage.from('article-files').remove([FULL_PDF_PATH])
})

for (const [device, viewport] of Object.entries(SIZES)) {
  test.describe(`${device}`, () => {
    test.use({ viewport })
    test.beforeEach(clearLeads)

    for (const { name, path } of PAGES) {
      test(`página · ${name}`, async ({ page }) => {
        await page.goto(webUrl(path))
        expect(await audit(page)).toEqual([])
      })
    }

    test('página · erro', async ({ page }) => {
      executeLocalSql('revoke select on public.articles from anon')
      try {
        await page.goto(webUrl('/artigos'))
        await expect(page.getByRole('heading', { level: 1, name: 'Algo deu errado' })).toBeVisible()
        expect(await audit(page)).toEqual([])
      } finally {
        executeLocalSql('grant select on public.articles to anon')
      }
    })

    test('modal · aberto', async ({ page }) => {
      await openModal(page)
      expect(await audit(page, '[role="dialog"]')).toEqual([])
    })

    test('modal · erros de validação', async ({ page }) => {
      const dialog = await openModal(page)
      await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
      await expect(dialog.locator('[aria-invalid="true"]').first()).toBeVisible()
      expect(await audit(page, '[role="dialog"]')).toEqual([])
    })

    test('modal · erro no envio (Turnstile recusado)', async ({ page }) => {
      const dialog = await openModal(page, TURNSTILE_FAIL_WEB_URL)
      await fillValid(dialog)
      await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
      await expect(dialog.getByRole('alert')).toBeVisible()
      expect(await audit(page, '[role="dialog"]')).toEqual([])
    })

    test('modal · sucesso e link expirado', async ({ page }) => {
      const dialog = await openModal(page)
      await fillValid(dialog)
      await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
      const done = page.getByRole('dialog', { name: 'Pronto!' })
      await expect(done).toBeVisible()
      const success = await audit(page, '[role="dialog"]')

      await page.clock.install()
      await page.clock.fastForward('02:00')
      await done.getByRole('button', { name: 'Baixar novamente' }).click()
      await expect(page.getByText('O link de download expirou.')).toBeVisible()
      const expired = await audit(page, '[role="dialog"]')

      expect({ success, expired }).toEqual({ success: [], expired: [] })
    })
  })
}
