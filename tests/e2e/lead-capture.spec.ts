import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { serviceClient } from '../integration/support/clients'
import { TURNSTILE_FAIL_WEB_URL, webUrl } from './support/urls'

// Captura de lead (spec 04) na página do artigo do seed, com as chaves de teste do Turnstile.

const ARTICLE_PATH = '/artigos/carteira-recomendada-outubro'
const ARTICLE_ID = '22222222-2222-4222-8222-222222222222'
// PDF completo do artigo do seed (article_contents.full_pdf_path), que o seed não envia ao Storage.
const FULL_PDF_PATH = `${ARTICLE_ID}/b1b2c3d4-0000-4000-8000-000000000003.pdf`

const LEAD = { name: 'Maria Silva', email: 'maria.e2e@exemplo.com.br', phone: '11987654321' }

test.beforeAll(async () => {
  const { error } = await serviceClient()
    .storage.from('article-files')
    .upload(FULL_PDF_PATH, new Blob(['%PDF-1.4 completo e2e'], { type: 'application/pdf' }), {
      upsert: true,
    })
  if (error) throw error
})

test.afterAll(async () => {
  await serviceClient().storage.from('article-files').remove([FULL_PDF_PATH])
})

// Leads e contadores de rate limit zerados antes de cada teste (service role).
test.beforeEach(async () => {
  const service = serviceClient()
  const leads = await service.from('leads').delete().eq('article_id', ARTICLE_ID)
  if (leads.error) throw leads.error
  const limits = await service.from('lead_rate_limits').delete().neq('key', '')
  if (limits.error) throw limits.error
})

async function fillValidForm(dialog: Locator) {
  await dialog.getByLabel('Nome', { exact: true }).fill(LEAD.name)
  await dialog.getByLabel('E-mail', { exact: true }).fill(LEAD.email)
  await dialog.getByLabel('Telefone', { exact: true }).fill(LEAD.phone)
  await dialog.getByRole('checkbox', { name: 'Li e concordo com o aviso de privacidade.' }).click()
  await expect(dialog.locator('input[name="cf-turnstile-response"]')).not.toHaveValue('')
}

async function openModal(page: Page, url: string = webUrl(ARTICLE_PATH)) {
  await page.goto(url)
  await page.getByRole('button', { name: 'Baixar artigo completo' }).click()
  return page.getByRole('dialog', { name: 'Baixe o artigo completo' })
}

test.describe('LEAD-001 · Modal', () => {
  test('abre com título, artigo · formato e foco no nome; Esc fecha', async ({ page }) => {
    const dialog = await openModal(page)

    await expect(dialog.getByText('Carteira recomendada de outubro · PDF')).toBeVisible()
    await expect(dialog.getByLabel('Nome', { exact: true })).toBeFocused()
    await expect(dialog.getByLabel('E-mail', { exact: true })).toHaveAttribute(
      'autocomplete',
      'email',
    )
    await expect(dialog.getByLabel('Telefone', { exact: true })).toHaveAttribute(
      'autocomplete',
      'tel',
    )

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('mascara o telefone', async ({ page }) => {
    const dialog = await openModal(page)
    const phone = dialog.getByLabel('Telefone', { exact: true })

    await phone.pressSequentially('11987654321')
    await expect(phone).toHaveValue('(11) 98765-4321')
    await phone.fill('+55 21 3456-7890')
    await expect(phone).toHaveValue('(21) 3456-7890')
  })

  test('envio com campos inválidos mostra os erros da spec e foca o primeiro', async ({ page }) => {
    const dialog = await openModal(page)
    await dialog.getByLabel('E-mail', { exact: true }).fill('maria@')
    await dialog.getByLabel('Telefone', { exact: true }).fill('98765-4321')

    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()

    await expect(dialog.getByText('Informe seu nome.')).toBeVisible()
    await expect(
      dialog.getByText('Informe um e-mail válido, como nome@exemplo.com.br.'),
    ).toBeVisible()
    await expect(
      dialog.getByText('Informe o telefone com DDD, no formato (99) 99999-9999.'),
    ).toBeVisible()
    await expect(dialog.getByLabel('Nome', { exact: true })).toBeFocused()
    await expect(dialog.getByLabel('Nome', { exact: true })).toHaveAttribute('aria-invalid', 'true')
  })

  test('carrega o widget do Turnstile sob a CSP', async ({ page }) => {
    const violations: string[] = []
    page.on('console', (message) => {
      if (message.text().includes('Content Security Policy')) violations.push(message.text())
    })
    const dialog = await openModal(page)

    // O iframe fica num shadow root fechado: conferir pelo frame e pelo token emitido.
    await expect
      .poll(() => page.frames().some((frame) => frame.url().includes('challenges.cloudflare.com')))
      .toBe(true)
    await expect(dialog.locator('input[name="cf-turnstile-response"]')).not.toHaveValue('')
    expect(violations.filter((text) => text.includes('challenges.cloudflare.com'))).toEqual([])
  })
})

test.describe('LEAD-003 · Consentimento', () => {
  test('mostra o aviso de LEAD-013 e o checkbox desmarcado com link para /privacidade', async ({
    page,
  }) => {
    const dialog = await openModal(page)

    await expect(
      dialog.getByText(
        'Usaremos seu nome, e-mail e telefone para enviar este material e registrar seu interesse. Se você autorizar abaixo, também poderemos enviar novidades da Rio Negro.',
        { exact: true },
      ),
    ).toBeVisible()
    const consent = dialog.getByRole('checkbox', {
      name: 'Li e concordo com o aviso de privacidade.',
    })
    await expect(consent).not.toBeChecked()
    const link = dialog.getByRole('link', { name: 'aviso de privacidade' })
    await expect(link).toHaveAttribute('href', '/privacidade')
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('sem o checkbox, o client bloqueia o envio sem chamar a action', async ({ page }) => {
    const actions: string[] = []
    page.on('request', (request) => {
      if (request.headers()['next-action']) actions.push(request.url())
    })
    const dialog = await openModal(page)
    await dialog.getByLabel('Nome', { exact: true }).fill('Maria Silva')
    await dialog.getByLabel('E-mail', { exact: true }).fill('maria@exemplo.com.br')
    await dialog.getByLabel('Telefone', { exact: true }).fill('11987654321')

    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()

    await expect(dialog.getByText('Marque esta opção para continuar.')).toBeVisible()
    await expect(
      dialog.getByRole('checkbox', { name: 'Li e concordo com o aviso de privacidade.' }),
    ).toBeFocused()
    expect(actions).toEqual([])
  })
})

test.describe('LEAD-004 · Opt-in', () => {
  test('é opcional, vem desmarcado e marca com um clique', async ({ page }) => {
    const dialog = await openModal(page)
    const optIn = dialog.getByRole('checkbox', {
      name: 'Aceito receber novidades da Rio Negro por e-mail, telefone ou WhatsApp.',
    })

    await expect(optIn).not.toBeChecked()
    await optIn.click()
    await expect(optIn).toBeChecked()
    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
    await expect(dialog.getByText('Informe seu nome.')).toBeVisible()
    await expect(optIn).not.toHaveAttribute('aria-invalid')
  })
})

test.describe('LEAD-010 · Sucesso', () => {
  test('o download começa sozinho e a tela mostra "Baixar novamente" e o CTA', async ({ page }) => {
    const dialog = await openModal(page)
    await expect(dialog.getByRole('link', { name: /Conheça a Rio Negro/ })).toHaveCount(0)
    await fillValidForm(dialog)

    const download = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
    expect((await download).url()).toContain('/storage/v1/object/sign/article-files/')

    const success = page.getByRole('dialog', { name: 'Pronto!' })
    await expect(success.getByText('O download começou.')).toBeVisible()
    await expect(
      success.getByText('“Carteira recomendada de outubro” está sendo salvo no seu dispositivo.'),
    ).toBeVisible()
    const cta = success.getByRole('link', { name: /Conheça a Rio Negro/ })
    await expect(cta).toHaveAttribute('href', 'https://rionegroinvestimentos.com.br')
    await expect(cta).toHaveAttribute('target', '_blank')

    const again = page.waitForEvent('download')
    await success.getByRole('button', { name: 'Baixar novamente' }).click()
    expect((await again).url()).toBe((await download).url())
  })

  test('"Baixar novamente" com a URL vencida volta ao formulário vazio', async ({ page }) => {
    await page.clock.install()
    const dialog = await openModal(page)
    await fillValidForm(dialog)
    const download = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
    await download

    await page.clock.fastForward(61_000)
    await page.getByRole('button', { name: 'Baixar novamente' }).click()

    const form = page.getByRole('dialog', { name: 'Baixe o artigo completo' })
    await expect(form.getByText('O link de download expirou.')).toBeVisible()
    await expect(form.getByLabel('Nome', { exact: true })).toHaveValue('')
    await expect(form.getByLabel('E-mail', { exact: true })).toHaveValue('')
  })
})

test.describe('LEAD-011 · Nenhum dado pessoal no navegador', () => {
  const PERSONAL = [LEAD.name, 'Maria', LEAD.email, 'maria.e2e', LEAD.phone, '98765-4321', '98765']

  async function browserState(page: Page) {
    return page.evaluate(async () => {
      const dump = (storage: Storage) =>
        Array.from({ length: storage.length }, (_, index) => {
          const key = storage.key(index) ?? ''
          return `${key}=${storage.getItem(key)}`
        })

      const indexedDbRows: string[] = []
      for (const info of await indexedDB.databases()) {
        if (!info.name) continue
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open(info.name ?? '')
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
        for (const store of Array.from(db.objectStoreNames)) {
          const rows = await new Promise<unknown[]>((resolve) => {
            const request = db.transaction(store).objectStore(store).getAll()
            request.onsuccess = () => resolve(request.result)
          })
          indexedDbRows.push(`${info.name}/${store}:${JSON.stringify(rows)}`)
        }
        db.close()
      }

      return {
        localStorage: dump(localStorage),
        sessionStorage: dump(sessionStorage),
        indexedDb: indexedDbRows,
        url: location.href,
      }
    })
  }

  test('após o download, nada do lead em storage, IndexedDB, cookies, URLs ou console', async ({
    page,
    context,
  }) => {
    const consoleLines: string[] = []
    const urls: string[] = []
    page.on('console', (message) => consoleLines.push(message.text()))
    page.on('pageerror', (error) => consoleLines.push(error.message))
    page.on('framenavigated', (frame) => urls.push(frame.url()))

    const dialog = await openModal(page)
    await fillValidForm(dialog)
    const download = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
    await download
    await expect(page.getByRole('dialog', { name: 'Pronto!' })).toBeVisible()

    const state = await browserState(page)
    const cookies = (await context.cookies()).map((cookie) => `${cookie.name}=${cookie.value}`)
    const everything = JSON.stringify({ state, cookies, urls, consoleLines })
    for (const value of PERSONAL) {
      expect(everything, `"${value}" vazou para o navegador`).not.toContain(value)
    }
    expect(state.url).toBe(webUrl(ARTICLE_PATH))
  })

  test('fechar o modal limpa o formulário', async ({ page }) => {
    const dialog = await openModal(page)
    await dialog.getByLabel('Nome', { exact: true }).fill(LEAD.name)
    await dialog.getByLabel('E-mail', { exact: true }).fill(LEAD.email)
    await dialog.getByLabel('Telefone', { exact: true }).fill(LEAD.phone)
    await dialog
      .getByRole('checkbox', { name: 'Li e concordo com o aviso de privacidade.' })
      .click()

    await dialog.getByRole('button', { name: 'Fechar' }).click()
    await page.getByRole('button', { name: 'Baixar artigo completo' }).click()

    await expect(dialog.getByLabel('Nome', { exact: true })).toHaveValue('')
    await expect(dialog.getByLabel('E-mail', { exact: true })).toHaveValue('')
    await expect(dialog.getByLabel('Telefone', { exact: true })).toHaveValue('')
    await expect(
      dialog.getByRole('checkbox', { name: 'Li e concordo com o aviso de privacidade.' }),
    ).not.toBeChecked()
  })
})

test.describe('LEAD-007 · Fluxo completo', () => {
  const submitButton = (dialog: Locator) =>
    dialog.getByRole('button', { name: 'Baixar artigo completo' })

  async function leadsInDb() {
    const { data, error } = await serviceClient()
      .from('leads')
      .select('email, phone, article_title_snapshot, policy_version')
      .eq('article_id', ARTICLE_ID)
    if (error) throw error
    return data
  }

  test('sucesso: grava o lead no banco e dispara o download', async ({ page }) => {
    const dialog = await openModal(page)
    await fillValidForm(dialog)

    const download = page.waitForEvent('download')
    await submitButton(dialog).click()

    expect(await (await download).failure()).toBeNull()
    await expect(page.getByRole('dialog', { name: 'Pronto!' })).toBeVisible()
    expect(await leadsInDb()).toEqual([
      {
        email: LEAD.email,
        phone: '+5511987654321',
        article_title_snapshot: 'Carteira recomendada de outubro',
        policy_version: 'blog-2026-09-v1',
      },
    ])
  })

  test('rate limit: o 4º envio do mesmo e-mail recebe "Muitas tentativas"', async ({ page }) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const dialog = await openModal(page)
      await fillValidForm(dialog)
      await submitButton(dialog).click()
      await expect(page.getByRole('dialog', { name: 'Pronto!' })).toBeVisible()
    }

    const dialog = await openModal(page)
    await fillValidForm(dialog)
    await submitButton(dialog).click()

    await expect(dialog.getByRole('alert')).toHaveText('Muitas tentativas, tente em alguns minutos')
    await expect(dialog.getByLabel('Nome', { exact: true })).toHaveValue(LEAD.name)
    expect(await leadsInDb()).toHaveLength(3)
  })

  test('Turnstile inválido: erro genérico, nenhum lead e nenhum download', async ({ page }) => {
    let downloads = 0
    page.on('download', () => downloads++)
    const dialog = await openModal(page, new URL(ARTICLE_PATH, TURNSTILE_FAIL_WEB_URL).href)
    await fillValidForm(dialog)

    await submitButton(dialog).click()

    await expect(dialog.getByRole('alert')).toHaveText(
      'Não foi possível concluir. Tente novamente.',
    )
    await expect(submitButton(dialog)).toBeEnabled()
    expect(await leadsInDb()).toEqual([])
    expect(downloads).toBe(0)
  })
})

// Fidelidade visual (spec 04, UI): só com VISUAL=1. Salva o app e o protótipo em __visual__.
test.describe('Visual · Modal de lead', () => {
  test.skip(!process.env.VISUAL, 'Gerado só com VISUAL=1')
  test.setTimeout(180_000)

  const OUT = path.join(import.meta.dirname, '__visual__')
  const PROTOTYPE = pathToFileURL(
    path.join(import.meta.dirname, '../../design/prototipo/Modal de Lead.dc.html'),
  ).href
  const SIZES = {
    desktop: { width: 1440, height: 960 },
    mobile: { width: 390, height: 844 },
  } as const
  // Tira o mouse do botão (hover) e espera a transição de cor (--duration-fast) dos campos.
  async function settle(page: Page) {
    await page.mouse.move(0, 0)
    await page.waitForTimeout(300)
  }

  const STATES = {
    vazio: 'vazio',
    erros: 'erros de validação',
    enviando: 'enviando',
    'erro-generico': 'erro genérico',
    'muitas-tentativas': 'erro muitas tentativas',
    sucesso: 'sucesso',
  } as const

  for (const [device, viewport] of Object.entries(SIZES)) {
    test(device, async ({ browser }) => {
      const shot = (name: string) => path.join(OUT, `modal-${name}-${device}`)

      const prototype = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
      await prototype.goto(PROTOTYPE, { waitUntil: 'networkidle' })
      for (const [name, label] of Object.entries(STATES)) {
        await prototype
          .locator(`[data-screen-label="Modal de lead · ${label} · ${device}"] > div`)
          .first()
          .screenshot({ path: `${shot(name)}-prototipo.png` })
      }
      await prototype.close()

      const page = await browser.newPage({ viewport })
      const dialog = await openModal(page)
      await expect(dialog.locator('input[name="cf-turnstile-response"]')).not.toHaveValue('')
      await page.screenshot({ path: `${shot('vazio')}-app.png` })

      await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
      await expect(dialog.getByText('Informe seu nome.')).toBeVisible()
      await page.screenshot({ path: `${shot('erros')}-app.png` })

      // Segura a resposta da action para fotografar o "Enviando…".
      let release = () => {}
      await page.route(webUrl(ARTICLE_PATH), async (route) => {
        if (route.request().headers()['next-action']) {
          await new Promise<void>((resolve) => (release = resolve))
        }
        await route.continue()
      })
      await fillValidForm(dialog)
      await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
      await expect(dialog.getByRole('button', { name: 'Enviando…' })).toBeVisible()
      await settle(page)
      await page.screenshot({ path: `${shot('enviando')}-app.png` })
      release()

      const success = page.getByRole('dialog', { name: 'Pronto!' })
      await expect(success).toBeVisible()
      await page.screenshot({ path: `${shot('sucesso')}-app.png` })
      await page.unroute(webUrl(ARTICLE_PATH))

      for (let attempt = 2; attempt <= 3; attempt++) {
        const again = await openModal(page)
        await fillValidForm(again)
        await again.getByRole('button', { name: 'Baixar artigo completo' }).click()
        await expect(success).toBeVisible()
      }
      const limited = await openModal(page)
      await fillValidForm(limited)
      await limited.getByRole('button', { name: 'Baixar artigo completo' }).click()
      await expect(limited.getByRole('alert')).toBeVisible()
      await settle(page)
      await page.screenshot({ path: `${shot('muitas-tentativas')}-app.png` })

      const failing = await openModal(page, new URL(ARTICLE_PATH, TURNSTILE_FAIL_WEB_URL).href)
      await fillValidForm(failing)
      await failing.getByRole('button', { name: 'Baixar artigo completo' }).click()
      await expect(failing.getByRole('alert')).toBeVisible()
      await settle(page)
      await page.screenshot({ path: `${shot('erro-generico')}-app.png` })
    })
  }
})
