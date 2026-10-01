import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import { serviceClient } from '../integration/support/clients'
import { signInAsAdmin } from './support/admin'

// ADM-013 · Leads no admin: lista por artigo e geral, paginação, CSV e exclusão.

const ARTICLE = {
  id: '22222222-2222-4222-8222-222222222222',
  title: 'Carteira recomendada de outubro',
}
const EMPTY_ARTICLE_ID = '33333333-3333-4333-8333-333333333333'
const NAMES = [
  'Maria Silva',
  'João Pereira',
  'Ana Costa',
  'Carlos Mendes',
  'Fernanda Lima',
  'Ricardo Alves',
  'Patrícia Rocha',
  'Bruno Carvalho',
  'Juliana Martins',
  'Eduardo Nunes',
  'Luísa Barros',
  'Marcos Teixeira',
]
const STATUSES = ['sent', 'sent', 'failed', 'pending', 'sent', 'disabled'] as const

// 12 leads do artigo do seed, um por hora, o primeiro nome é o mais recente.
async function seedLeads() {
  const service = serviceClient()
  await service.from('leads').delete().not('email', 'is', null)
  const start = Date.parse('2026-09-24T17:32:00Z')
  const { error } = await service.from('leads').insert(
    NAMES.map((name, index) => ({
      article_id: ARTICLE.id,
      article_title_snapshot: ARTICLE.title,
      name,
      email: `${name.split(' ')[0]?.toLowerCase()}.e2e@exemplo.com.br`,
      phone: `+55119${String(87654321 - index).padStart(8, '0')}`,
      consent_at: new Date(start - index * 3_600_000).toISOString(),
      created_at: new Date(start - index * 3_600_000).toISOString(),
      policy_version: 'v1',
      marketing_opt_in: index % 2 === 0,
      ip_hash: 'hash-e2e',
      webhook_status: STATUSES[index % STATUSES.length],
    })),
  )
  if (error) throw error
}

async function clearLeads() {
  await serviceClient().from('leads').delete().eq('ip_hash', 'hash-e2e')
}

test.describe('leads', () => {
  test.beforeEach(seedLeads)
  test.afterAll(clearLeads)

  test('por artigo: subtítulo, colunas, ordem e paginação de 10', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto(`/artigos/${ARTICLE.id}/leads`)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Leads')
    await expect(page.getByText(`12 leads · ${ARTICLE.title}`)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Artigos' }).first()).toBeVisible()
    const table = page.getByRole('table', { name: 'Leads' })
    await expect(table.getByRole('columnheader')).toHaveText([
      'Data',
      'Artigo',
      'Nome',
      'E-mail',
      'Telefone',
      'Comunicações',
      'Envio',
      'Ações',
    ])
    const firstRow = table.getByRole('row').nth(1)
    await expect(firstRow).toContainText('24/09/2026')
    await expect(firstRow).toContainText('14:32')
    await expect(firstRow).toContainText('Maria Silva')
    await expect(firstRow).toContainText('(11) 98765-4321')
    await expect(firstRow).toContainText('Sim')
    await expect(firstRow).toContainText('Enviado')
    await expect(table.getByRole('row')).toHaveCount(11)
    await expect(page.getByText('Mostrando 1–10 de 12')).toBeVisible()

    await page.getByRole('link', { name: 'Próxima página' }).click()
    await expect(page).toHaveURL(/\?pagina=2$/)
    await expect(page.getByText('Mostrando 11–12 de 12')).toBeVisible()
    await expect(table.getByRole('row').nth(1)).toContainText('Luísa Barros')
  })

  test('geral: inclui lead de artigo excluído com o título original', async ({ page }) => {
    await serviceClient()
      .from('leads')
      .update({ article_id: null, article_title_snapshot: 'Artigo que foi excluído' })
      .eq('name', 'Marcos Teixeira')
    await signInAsAdmin(page)
    await page.getByRole('link', { name: 'Leads', exact: true }).click()

    await expect(page.getByText('12 leads · todos os artigos')).toBeVisible()
    await page.goto('/leads?pagina=2')
    await expect(page.getByRole('row').filter({ hasText: 'Marcos Teixeira' })).toContainText(
      'Artigo que foi excluído',
    )
  })

  test('Exportar CSV baixa o arquivo com BOM, `;` e os leads', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto(`/artigos/${ARTICLE.id}/leads`)

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: 'Exportar CSV' }).click(),
    ])
    const stream = await download.createReadStream()
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(Buffer.from(chunk))
    const bytes = Buffer.concat(chunks)

    expect(download.suggestedFilename()).toMatch(/^leads-\d{4}-\d{2}-\d{2}\.csv$/)
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    const lines = bytes.toString('utf8').slice(1).trim().split('\r\n')
    expect(lines[0]).toBe('data;artigo;nome;email;telefone;aceite_comunicacoes;status_webhook')
    expect(lines).toHaveLength(13)
    expect(lines[1]).toBe(
      `24/09/2026 14:32;${ARTICLE.title};Maria Silva;maria.e2e@exemplo.com.br;(11) 98765-4321;Sim;sent`,
    )
  })

  test('excluir lead pede confirmação e remove da lista', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto(`/artigos/${ARTICLE.id}/leads`)
    const row = page.getByRole('row').filter({ hasText: 'Ana Costa' })

    await row.getByRole('button', { name: 'Excluir lead' }).click()
    const dialog = page.getByRole('dialog', { name: 'Excluir lead?' })
    await expect(dialog).toContainText(
      'Os dados de Ana Costa (ana.e2e@exemplo.com.br) serão apagados. Esta ação não pode ser desfeita.',
    )
    await dialog.getByRole('button', { name: 'Excluir lead' }).click()

    await expect(dialog).toBeHidden()
    await expect(row).toHaveCount(0)
    await expect(page.getByText(`11 leads · ${ARTICLE.title}`)).toBeVisible()
  })

  test('mobile: cards e exclusão pelo menu Ações', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await signInAsAdmin(page)
    await page.goto(`/artigos/${ARTICLE.id}/leads`)

    const cards = page.getByRole('list', { name: 'Leads' }).getByRole('listitem')
    await expect(cards).toHaveCount(10)
    await cards.first().getByRole('button', { name: 'Ações' }).click()
    const actions = page.getByRole('dialog', { name: 'Ações do lead' })
    await expect(actions).toContainText('Maria Silva · maria.e2e@exemplo.com.br')
    await actions.getByRole('button', { name: 'Excluir lead' }).click()
    await expect(page.getByRole('dialog', { name: 'Excluir lead?' })).toBeVisible()
  })

  test('ADM-014 · Reenviar falhas mostra enviados e falhas e soma as tentativas', async ({
    page,
  }) => {
    await signInAsAdmin(page)
    await page.goto(`/artigos/${ARTICLE.id}/leads`)

    await page.getByRole('button', { name: 'Reenviar falhas (2)' }).click()

    const status = page.getByRole('status').filter({ hasText: 'Reenvio concluído' })
    await expect(status).toContainText('0 enviados · 2 falharam')
    const { data } = await serviceClient()
      .from('leads')
      .select('webhook_status, webhook_attempts')
      .eq('ip_hash', 'hash-e2e')
      .eq('webhook_status', 'failed')
    expect(data).toEqual([
      { webhook_status: 'failed', webhook_attempts: 1 },
      { webhook_status: 'failed', webhook_attempts: 1 },
    ])
  })

  test('vazio: mensagem e ações desabilitadas', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto(`/artigos/${EMPTY_ARTICLE_ID}/leads`)

    await expect(page.getByText('Nenhum lead recebido ainda.').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Reenviar falhas' })).toBeDisabled()
    await expect(page.getByText('0 leads ·')).toBeVisible()
  })
})

// Fidelidade visual (spec 05, UI): só com VISUAL=1. Salva o app e o protótipo em __visual__.
test.describe('Visual · Leads', () => {
  test.skip(!process.env.VISUAL, 'Gerado só com VISUAL=1')
  test.beforeEach(seedLeads)
  test.afterAll(clearLeads)

  const OUT = path.join(import.meta.dirname, '__visual__')
  const PROTOTYPE = pathToFileURL(
    path.join(import.meta.dirname, '../../design/prototipo/Admin.dc.html'),
  ).href
  const SIZES = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 },
  } as const

  async function prototypeShot(page: Page, label: string, file: string) {
    await page.goto(PROTOTYPE, { waitUntil: 'networkidle' })
    await page
      .locator(`[data-screen-label="${label}"] > div`)
      .first()
      .screenshot({ path: path.join(OUT, `${file}-prototipo.png`) })
  }

  const SCREENS = [
    { state: 'por artigo', file: 'por-artigo', url: `/artigos/${ARTICLE.id}/leads` },
    { state: 'geral', file: 'geral', url: '/leads' },
    { state: 'vazio', file: 'vazio', url: `/artigos/${EMPTY_ARTICLE_ID}/leads` },
  ]

  for (const [device, viewport] of Object.entries(SIZES)) {
    for (const screen of SCREENS) {
      test(`${device} · ${screen.state}`, async ({ browser }) => {
        const prototype = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
        await prototypeShot(
          prototype,
          `Leads · ${screen.state} · ${device}`,
          `admin-leads-${screen.file}-${device}`,
        )
        await prototype.close()

        const page = await browser.newPage({ viewport })
        await signInAsAdmin(page)
        await page.goto(screen.url)
        await page.mouse.move(0, 0)
        await page.screenshot({
          path: path.join(OUT, `admin-leads-${screen.file}-${device}-app.png`),
          fullPage: true,
        })
        await page.close()
      })
    }

    test(`${device} · confirmar exclusão`, async ({ browser }) => {
      const prototype = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
      await prototypeShot(
        prototype,
        `Leads · confirmar exclusão · ${device}`,
        `admin-leads-excluir-${device}`,
      )
      await prototype.close()

      const page = await browser.newPage({ viewport })
      await signInAsAdmin(page)
      await page.goto('/leads')
      if (device === 'mobile') {
        await page.getByRole('button', { name: 'Ações' }).first().click()
        await page
          .getByRole('dialog', { name: 'Ações do lead' })
          .getByRole('button', { name: 'Excluir lead' })
          .click()
      } else {
        await page.getByRole('button', { name: 'Excluir lead' }).first().click()
      }
      await expect(page.getByRole('dialog', { name: 'Excluir lead?' })).toBeVisible()
      await page.screenshot({ path: path.join(OUT, `admin-leads-excluir-${device}-app.png`) })
      await page.close()
    })
  }

  test('mobile · menu de ações', async ({ browser }) => {
    const prototype = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
    await prototypeShot(prototype, 'Leads · menu de ações · mobile', 'admin-leads-acoes-mobile')
    await prototype.close()

    const page = await browser.newPage({ viewport: SIZES.mobile })
    await signInAsAdmin(page)
    await page.goto('/leads')
    await page.getByRole('button', { name: 'Ações' }).first().click()
    await expect(page.getByRole('dialog', { name: 'Ações do lead' })).toBeVisible()
    await page.screenshot({ path: path.join(OUT, 'admin-leads-acoes-mobile-app.png') })
    await page.close()
  })
})
