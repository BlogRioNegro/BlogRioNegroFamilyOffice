import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test, type BrowserContext } from '@playwright/test'
import { serviceClient } from '../integration/support/clients'
import { signInAsAdmin } from './support/admin'
import { webUrl } from './support/urls'

// ADM-004 · Formulário de artigo: erros por campo e publicação imediata no site.

const SEED = {
  id: '22222222-2222-4222-8222-222222222222',
  slug: 'carteira-recomendada-outubro',
  title: 'Carteira recomendada de outubro',
}

// PDF de 24,6 MB (base 1024) para o erro de tamanho da spec 05.
function bigPdf() {
  return {
    name: 'cenario-macro-4t26.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.alloc(Math.floor(24.6 * 1024 * 1024)),
  }
}

const SEED_PNG = path.join(
  import.meta.dirname,
  '../../supabase/storage/covers/11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
)

const SEED_PDF = path.join(
  import.meta.dirname,
  '../../supabase/storage/article-previews/22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf',
)

const MIB = 1024 * 1024

// Imagem 4000 × 2250 com gradiente e ruído, gerada num canvas: JPEG 95% ≈ 3,3 MB e PNG ≈ 16 MB.
async function generatedImage(context: BrowserContext, type: 'image/jpeg' | 'image/png') {
  const page = await context.newPage()
  const base64 = await page.evaluate(async (mime) => {
    const width = 4000
    const height = 2250
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context2d = canvas.getContext('2d')
    if (!context2d) throw new Error('canvas sem 2d')
    const image = context2d.createImageData(width, height)
    for (let index = 0; index < image.data.length; index += 4) {
      const pixel = index / 4
      const noise = (Math.random() - 0.5) * 20
      image.data[index] = ((pixel % width) / width) * 200 + noise
      image.data[index + 1] = (Math.floor(pixel / width) / height) * 180 + noise
      image.data[index + 2] = 120 + noise
      image.data[index + 3] = 255
    }
    context2d.putImageData(image, 0, 0)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.95))
    if (!blob) throw new Error('toBlob falhou')
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
  }, type)
  await page.close()
  return Buffer.from(base64, 'base64')
}

/** Largura do JPEG pelo marcador SOF (C0 a C2). */
function jpegWidth(bytes: Buffer): number | null {
  let offset = 2
  while (offset + 9 < bytes.length) {
    const marker = bytes[offset + 1] ?? 0
    if (marker >= 0xc0 && marker <= 0xc2) return bytes.readUInt16BE(offset + 7)
    offset += 2 + bytes.readUInt16BE(offset + 2)
  }
  return null
}

test.describe('formulário de artigo', () => {
  test.afterAll(async () => {
    await serviceClient().from('articles').update({ title: SEED.title }).eq('id', SEED.id)
  })

  test('mostra erros por campo sem enviar', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')

    await page.getByRole('button', { name: 'Publicar' }).click()

    await expect(page.getByLabel('Título', { exact: true })).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Informe um título de 3 a 160 caracteres.')).toBeVisible()
    await expect(page.getByText('Envie a capa do artigo.')).toBeVisible()
  })

  test('PDF acima do limite mostra o erro no campo sem enviar', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')

    await page.getByLabel('Arquivo PDF').setInputFiles(bigPdf())
    await page.getByRole('button', { name: 'Publicar' }).click()

    await expect(page.getByText('O arquivo tem 24,6 MB. Envie um PDF de até 20 MB.')).toBeVisible()
    await expect(page).toHaveURL(/\/artigos\/novo$/)
  })

  test('editor Texto: barra da ADM-005 e imagem só com texto alternativo', async ({ page }) => {
    const cspViolations: string[] = []
    page.on('console', (message) => {
      if (message.text().includes('Content Security Policy')) cspViolations.push(message.text())
    })
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')
    const articleId = await page.locator('input[name="id"]').inputValue()
    // Só o editor: a carga em modo dev (`next dev`) tem violações de estilo próprias.
    cspViolations.length = 0

    await page.getByRole('group', { name: 'Tipo' }).getByRole('button', { name: 'Texto' }).click()
    const toolbar = page.getByRole('toolbar', { name: 'Formatação' })
    const labels = [
      'H2',
      'H3',
      'Negrito',
      'Itálico',
      'Lista',
      'Lista numerada',
      'Link',
      'Citação',
      'Imagem',
    ]
    await expect(toolbar.getByRole('button')).toHaveText(labels)

    const editor = page.getByRole('textbox', { name: 'Conteúdo' })
    await editor.click()
    await page.keyboard.type('Primeiro parágrafo')
    expect(cspViolations).toEqual([])
    await toolbar.getByRole('button', { name: 'Imagem' }).click()
    const dialog = page.getByRole('dialog', { name: 'Imagem' })
    await dialog.getByLabel('Arquivo').setInputFiles(SEED_PNG)
    await dialog.getByRole('button', { name: 'Inserir' }).click()
    await expect(dialog.getByText('Descreva a imagem para quem não pode vê-la.')).toBeVisible()

    await dialog.getByLabel('Texto alternativo').fill('Gráfico da Selic')
    await dialog.getByRole('button', { name: 'Inserir' }).click()
    await expect(dialog).toBeHidden()
    await expect(editor.locator('img[alt="Gráfico da Selic"]')).toHaveAttribute(
      'src',
      new RegExp(`/article-images/${articleId}/`),
    )

    const storage = serviceClient().storage.from('article-images')
    const { data } = await storage.list(articleId)
    await storage.remove((data ?? []).map((file) => `${articleId}/${file.name}`))
  })

  test('ADM-010 · data editada muda a ordem da lista e o destaque do site', async ({ page }) => {
    const service = serviceClient()
    const { data: before } = await service
      .from('articles')
      .select('published_at')
      .eq('id', SEED.id)
      .single()
    await signInAsAdmin(page)
    await page.goto(`/artigos/${SEED.id}`)

    await page.getByLabel('Data de publicação').fill('2030-01-15')
    await page.getByRole('button', { name: 'Publicar' }).click()

    try {
      await expect(page).toHaveURL(/\/artigos$/)
      const firstRow = page
        .getByRole('table', { name: 'Artigos publicados' })
        .getByRole('row')
        .nth(1)
      await expect(firstRow).toContainText(SEED.title)
      await expect(firstRow).toContainText('Em destaque')
      await expect(firstRow).toContainText('15/01/2030')

      await page.goto(webUrl('/artigos'))
      await expect(page.getByRole('main').getByRole('heading', { level: 2 }).first()).toHaveText(
        SEED.title,
      )
    } finally {
      await service
        .from('articles')
        .update({ published_at: before?.published_at })
        .eq('id', SEED.id)
    }
  })

  test('ADR 0041 · capa acima de 5 MB é recusada no browser, sem envio', async ({
    page,
    context,
  }) => {
    const png = await generatedImage(context, 'image/png')
    expect(png.length).toBeGreaterThan(5 * MIB)
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')

    await page
      .getByLabel('Capa')
      .setInputFiles({ name: 'capa.png', mimeType: 'image/png', buffer: png })
    await page.getByRole('button', { name: 'Publicar' }).click()

    await expect(
      page.getByText(/^O arquivo tem [\d,]+ MB\. Envie uma imagem de até 5 MB\.$/),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/artigos\/novo$/)
  })

  test('ADR 0041 · capa de 2 a 5 MB é reduzida a 1920 px em JPEG de até 2 MB', async ({
    page,
    context,
  }) => {
    const service = serviceClient()
    const jpeg = await generatedImage(context, 'image/jpeg')
    expect(jpeg.length).toBeGreaterThan(2 * MIB)
    expect(jpeg.length).toBeLessThanOrEqual(5 * MIB)
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')
    const articleId = await page.locator('input[name="id"]').inputValue()

    await page.getByLabel('Título', { exact: true }).fill('Artigo com capa pesada')
    await page.getByLabel('Slug').fill(`capa-pesada-e2e-${Date.now()}`)
    await page
      .getByLabel('Capa')
      .setInputFiles({ name: 'capa-grande.jpeg', mimeType: 'image/jpeg', buffer: jpeg })
    await page.getByLabel('Arquivo PDF').setInputFiles(SEED_PDF)
    await page.getByRole('button', { name: 'Publicar' }).click()

    try {
      await expect(page).toHaveURL(/\/artigos$/)
      const { data: article } = await service
        .from('articles')
        .select('cover_path')
        .eq('id', articleId)
        .single()
      const coverPath = article?.cover_path ?? ''
      expect(coverPath).toMatch(new RegExp(`^${articleId}/[0-9a-f-]+\\.jpg$`))
      const { data: file } = await service.storage.from('covers').download(coverPath)
      const bytes = Buffer.from((await file?.arrayBuffer()) ?? new ArrayBuffer(0))
      expect(bytes.length).toBeLessThanOrEqual(2 * MIB)
      expect([...bytes.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff])
      expect(jpegWidth(bytes)).toBe(1920)
    } finally {
      await service.from('articles').delete().eq('id', articleId)
      for (const bucket of ['covers', 'article-files', 'article-previews']) {
        const { data } = await service.storage.from(bucket).list(articleId)
        const paths = (data ?? []).map((item) => `${articleId}/${item.name}`)
        if (paths.length > 0) await service.storage.from(bucket).remove(paths)
      }
    }
  })

  test('criar artigo PDF: original privado, prévia pública e artigo no site', async ({ page }) => {
    const service = serviceClient()
    const slug = `artigo-pdf-e2e-${Date.now()}`
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')
    const articleId = await page.locator('input[name="id"]').inputValue()

    await page.getByLabel('Título', { exact: true }).fill('Artigo PDF criado no E2E')
    await page.getByLabel('Slug').fill(slug)
    await page.getByLabel('Capa').setInputFiles(SEED_PNG)
    await page.getByLabel('Arquivo PDF').setInputFiles(SEED_PDF)
    await page.getByRole('button', { name: 'Publicar' }).click()

    try {
      await expect(page).toHaveURL(/\/artigos$/)
      await expect(page.getByRole('table').getByText('Artigo PDF criado no E2E')).toBeVisible()

      const { data: article } = await service
        .from('articles')
        .select('preview_pdf_path, article_contents(full_pdf_path)')
        .eq('id', articleId)
        .single()
      const fullPath = article?.article_contents?.full_pdf_path ?? ''
      const previewPath = article?.preview_pdf_path ?? ''
      const inArticleFolder = new RegExp(`^${articleId}/[0-9a-f-]+\\.pdf$`)
      expect(fullPath).toMatch(inArticleFolder)
      expect(previewPath).toMatch(inArticleFolder)
      expect((await service.storage.from('article-files').download(fullPath)).error).toBeNull()
      expect(
        (await service.storage.from('article-previews').download(previewPath)).error,
      ).toBeNull()
      const anonOriginal = await page.request.get(
        service.storage.from('article-files').getPublicUrl(fullPath).data.publicUrl,
      )
      expect(anonOriginal.ok()).toBe(false)

      await page.goto(webUrl(`/artigos/${slug}`))
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Artigo PDF criado no E2E')
    } finally {
      await service.from('articles').delete().eq('id', articleId)
      for (const bucket of ['covers', 'article-files', 'article-previews']) {
        const { data } = await service.storage.from(bucket).list(articleId)
        const paths = (data ?? []).map((file) => `${articleId}/${file.name}`)
        if (paths.length > 0) await service.storage.from(bucket).remove(paths)
      }
    }
  })

  test('criar artigo Texto: prévia de 3 blocos no site e PDF completo privado', async ({
    page,
  }) => {
    const service = serviceClient()
    const slug = `artigo-texto-e2e-${Date.now()}`
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')
    const articleId = await page.locator('input[name="id"]').inputValue()

    await page.getByLabel('Título', { exact: true }).fill('Artigo Texto criado no E2E')
    await page.getByLabel('Slug').fill(slug)
    await page.getByLabel('Capa').setInputFiles(SEED_PNG)
    await page.getByRole('group', { name: 'Tipo' }).getByRole('button', { name: 'Texto' }).click()
    await page.getByRole('textbox', { name: 'Conteúdo' }).click()
    for (const text of ['Bloco um.', 'Bloco dois.', 'Bloco três.', 'Bloco quatro, só no PDF.']) {
      await page.keyboard.type(text)
      await page.keyboard.press('Enter')
    }
    await page
      .getByRole('toolbar', { name: 'Formatação' })
      .getByRole('button', { name: 'Imagem' })
      .click()
    const dialog = page.getByRole('dialog', { name: 'Imagem' })
    await dialog.getByLabel('Arquivo').setInputFiles(SEED_PNG)
    await dialog.getByLabel('Texto alternativo').fill('Capa de exemplo')
    await dialog.getByRole('button', { name: 'Inserir' }).click()
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'Publicar' }).click()

    try {
      await expect(page).toHaveURL(/\/artigos$/)
      const { data: article } = await service
        .from('articles')
        .select('preview_json, article_contents(full_pdf_path, body_json)')
        .eq('id', articleId)
        .single()
      const fullPath = article?.article_contents?.full_pdf_path ?? ''
      expect(fullPath).toMatch(new RegExp(`^${articleId}/[0-9a-f-]+\\.pdf$`))
      const { data: pdfFile } = await service.storage.from('article-files').download(fullPath)
      expect(pdfFile?.type).toBe('application/pdf')
      expect(JSON.stringify(article?.article_contents?.body_json)).toContain('Bloco quatro')
      expect(JSON.stringify(article?.preview_json)).not.toContain('Bloco quatro')

      await page.goto(webUrl(`/artigos/${slug}`))
      await expect(page.getByText('Bloco três.')).toBeVisible()
      await expect(page.getByText('Bloco quatro, só no PDF.')).toHaveCount(0)
    } finally {
      await service.from('articles').delete().eq('id', articleId)
      for (const bucket of ['covers', 'article-images', 'article-files']) {
        const { data } = await service.storage.from(bucket).list(articleId)
        const paths = (data ?? []).map((file) => `${articleId}/${file.name}`)
        if (paths.length > 0) await service.storage.from(bucket).remove(paths)
      }
    }
  })

  test('salvar a edição publica o novo título no site no próximo request', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto(`/artigos/${SEED.id}`)
    await expect(page.getByRole('heading', { name: 'Editar artigo' })).toBeVisible()

    await page
      .getByLabel('Título', { exact: true })
      .fill('Carteira recomendada de outubro (revisada)')
    await page.getByRole('button', { name: 'Publicar' }).click()

    await expect(page).toHaveURL(/\/artigos$/)
    await page.goto(webUrl(`/artigos/${SEED.slug}`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Carteira recomendada de outubro (revisada)',
    )
  })
})

// Fidelidade visual (spec 05, UI): só com VISUAL=1. Salva o app e o protótipo em __visual__.
test.describe('Visual · Formulário', () => {
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
        .locator(`[data-screen-label="Formulário · tipo PDF · vazio · ${device}"] > div`)
        .first()
        .screenshot({ path: path.join(OUT, `admin-form-pdf-${device}-prototipo.png`) })
      await prototype
        .locator(`[data-screen-label="Formulário · tipo PDF · erro · ${device}"] > div`)
        .first()
        .screenshot({ path: path.join(OUT, `admin-form-pdf-erro-${device}-prototipo.png`) })
      await prototype
        .locator(`[data-screen-label="Formulário · tipo Texto · ${device}"] > div`)
        .first()
        .screenshot({ path: path.join(OUT, `admin-form-texto-${device}-prototipo.png`) })
      await prototype.close()

      const page = await browser.newPage({ viewport })
      await signInAsAdmin(page)
      await page.goto('/artigos/novo')
      await page.mouse.move(0, 0)
      await page.screenshot({
        path: path.join(OUT, `admin-form-pdf-${device}-app.png`),
        fullPage: true,
      })
      await page.getByLabel('Arquivo PDF').setInputFiles(bigPdf())
      await page.getByRole('button', { name: 'Publicar' }).click()
      await page.getByText('O arquivo tem 24,6 MB').waitFor()
      await page.mouse.move(0, 0)
      await page.screenshot({
        path: path.join(OUT, `admin-form-pdf-erro-${device}-app.png`),
        fullPage: true,
      })

      await page.goto('/artigos/novo')
      await page
        .getByLabel('Título', { exact: true })
        .fill('Tesouro IPCA+ ou prefixado: como comparar')
      await page.getByLabel('Slug').fill('tesouro-ipca-ou-prefixado-como-comparar')
      await page.getByRole('group', { name: 'Tipo' }).getByRole('button', { name: 'Texto' }).click()
      const toolbar = page.getByRole('toolbar', { name: 'Formatação' })
      await page.getByRole('textbox', { name: 'Conteúdo' }).click()
      await toolbar.getByRole('button', { name: 'H2' }).click()
      await page.keyboard.type('O que cada título paga')
      await page.keyboard.press('Enter')
      await page.keyboard.type('O Tesouro Prefixado garante a taxa no momento da compra.')
      await page.keyboard.press('Enter')
      await toolbar.getByRole('button', { name: 'Lista', exact: true }).click()
      await page.keyboard.type('Prefixado: faz sentido quando você espera queda dos juros.')
      await page.mouse.move(0, 0)
      await page.screenshot({
        path: path.join(OUT, `admin-form-texto-${device}-app.png`),
        fullPage: true,
      })
      await page.close()
    })
  }
})
