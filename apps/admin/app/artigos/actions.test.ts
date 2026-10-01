import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PDFDocument, PDFName } from 'pdf-lib'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ARTICLE_MESSAGES } from '../../lib/domain/article-form'
import { GENERIC_ERROR_MESSAGE } from '../../lib/services/action-result'
import type { ArticleForEdit } from '../../lib/services/article-store'

const requireAdmin = vi.fn()
const store = {
  findArticleForEdit: vi.fn(),
  saveArticleRecord: vi.fn(),
  uploadFile: vi.fn(),
  removeFiles: vi.fn(),
  listArticleFiles: vi.fn(),
  deleteArticleRecord: vi.fn(),
  publicFileUrl: vi.fn(),
  downloadFile: vi.fn(),
}

vi.mock('../../lib/services/require-admin', () => ({ requireAdmin }))
const validateUpload = vi.fn()

vi.mock('../../lib/services/article-store', () => store)
vi.mock('../../lib/services/upload', () => ({ validateUpload }))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

const { deleteArticle, saveArticle, uploadArticleImage } = await import('./actions')

const ID = '4b4f7c5e-2d7a-4c1e-9d55-0a3f5c1e8b21'
const supabase = { marker: 'supabase' }

const EXISTING: ArticleForEdit = {
  id: ID,
  slug: 'carteira-de-outubro',
  title: 'Carteira de outubro',
  summary: null,
  cover_path: `${ID}/capa-antiga.png`,
  content_type: 'pdf',
  preview_json: null,
  preview_pdf_path: `${ID}/previa.pdf`,
  published_at: '2026-09-20T12:00:00.000Z',
  article_contents: { body_json: null, full_pdf_path: `${ID}/completo.pdf` },
}

function form(overrides: Record<string, string | File> = {}) {
  const values: Record<string, string | File> = {
    id: ID,
    title: 'Carteira recomendada de outubro',
    slug: 'carteira-de-outubro',
    summary: '',
    contentType: 'pdf',
    publishedDate: '2026-09-20',
    ...overrides,
  }
  const formData = new FormData()
  for (const [name, value] of Object.entries(values)) formData.set(name, value)
  return formData
}

const SEED_PNG = readFileSync(
  path.resolve(
    import.meta.dirname,
    '../../../../supabase/storage/covers/11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
  ),
)

function paragraphs(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    content: [{ type: 'text', text: `Parágrafo ${index + 1}` }],
  }))
}

async function pdf(pages: number, encrypted = false) {
  const doc = await PDFDocument.create()
  for (let page = 0; page < pages; page += 1) doc.addPage()
  if (encrypted)
    doc.context.trailerInfo.Encrypt = doc.context.register(
      doc.context.obj({ Filter: PDFName.of('Standard') }),
    )
  return new File([new Uint8Array(await doc.save())], 'relatorio.pdf', { type: 'application/pdf' })
}

const png = () => new File([new Uint8Array([1, 2, 3])], 'capa.png', { type: 'image/png' })

describe('saveArticle', () => {
  beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    requireAdmin.mockResolvedValue({ ok: true, supabase, userId: 'admin' })
    store.findArticleForEdit.mockResolvedValue(EXISTING)
    store.saveArticleRecord.mockResolvedValue(null)
    store.uploadFile.mockResolvedValue(null)
    store.publicFileUrl.mockImplementation(
      (_supabase: unknown, bucket: string, path: string) => `https://cdn.test/${bucket}/${path}`,
    )
    validateUpload.mockImplementation(async (_bucket: string, file: File) => ({
      ok: true,
      file,
      extension: 'png',
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('devolve a negação do requireAdmin sem tocar no banco', async () => {
    requireAdmin.mockResolvedValue({ ok: false, error: 'Sessão expirada' })

    expect(await saveArticle(null, form())).toEqual({
      ok: false,
      error: 'Sessão expirada',
      fieldErrors: {},
    })
    expect(store.findArticleForEdit).not.toHaveBeenCalled()
  })

  it('devolve erros por campo sem consultar o banco', async () => {
    const result = await saveArticle(null, form({ title: 'ab', slug: 'Slug Inválido' }))

    expect(result?.fieldErrors).toEqual({
      title: ARTICLE_MESSAGES.title,
      slug: ARTICLE_MESSAGES.slug,
    })
    expect(store.findArticleForEdit).not.toHaveBeenCalled()
  })

  it('edita mantendo capa, conteúdo e instante de publicação e volta para a lista', async () => {
    await expect(saveArticle(null, form())).rejects.toThrow('NEXT_REDIRECT:/artigos')

    expect(store.saveArticleRecord).toHaveBeenCalledWith(supabase, {
      article_id: ID,
      slug: 'carteira-de-outubro',
      title: 'Carteira recomendada de outubro',
      summary: undefined,
      cover_path: EXISTING.cover_path,
      content_type: 'pdf',
      published_at: EXISTING.published_at,
      preview_json: undefined,
      preview_pdf_path: `${ID}/previa.pdf`,
      body_json: undefined,
      full_pdf_path: `${ID}/completo.pdf`,
    })
    expect(store.uploadFile).not.toHaveBeenCalled()
  })

  it('troca a capa e remove a antiga depois de salvar', async () => {
    await expect(saveArticle(null, form({ cover: png() }))).rejects.toThrow('NEXT_REDIRECT')

    const [, bucket, path] = store.uploadFile.mock.calls[0] ?? []
    expect(bucket).toBe('covers')
    expect(path).toMatch(new RegExp(`^${ID}/[0-9a-f-]{36}\\.png$`))
    expect(store.saveArticleRecord.mock.calls[0]?.[1]).toMatchObject({ cover_path: path })
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'covers', [EXISTING.cover_path])
  })

  it('recusa a capa que não passa na validação de upload', async () => {
    validateUpload.mockResolvedValue({ ok: false, error: 'Envie uma imagem JPG ou PNG.' })

    const result = await saveArticle(null, form({ cover: png() }))

    expect(validateUpload).toHaveBeenCalledWith('covers', expect.any(File))
    expect(result?.fieldErrors.cover).toBe('Envie uma imagem JPG ou PNG.')
    expect(store.uploadFile).not.toHaveBeenCalled()
  })

  it('exige a capa na criação', async () => {
    store.findArticleForEdit.mockResolvedValue(null)

    const result = await saveArticle(null, form())

    expect(result?.fieldErrors.cover).toBe(ARTICLE_MESSAGES.cover)
    expect(store.saveArticleRecord).not.toHaveBeenCalled()
  })

  it('pede o conteúdo quando não há conteúdo do tipo escolhido', async () => {
    const result = await saveArticle(null, form({ contentType: 'rich_text' }))

    expect(result?.fieldErrors.content).toBe(ARTICLE_MESSAGES.richText)
    expect(store.saveArticleRecord).not.toHaveBeenCalled()
  })

  it('recusa rich text com imagem sem alt (ADR 0031)', async () => {
    const body = {
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: { src: `https://cdn.test/article-images/${ID}/foto.png`, alt: '' },
        },
      ],
    }

    const result = await saveArticle(
      null,
      form({ contentType: 'rich_text', body: JSON.stringify(body) }),
    )

    expect(result?.fieldErrors.content).toBe('Toda imagem precisa de texto alternativo.')
    expect(store.saveArticleRecord).not.toHaveBeenCalled()
  })

  it('recusa rich text com imagem de fora do bucket do artigo', async () => {
    const body = {
      type: 'doc',
      content: [{ type: 'image', attrs: { src: 'https://exemplo.com/foto.png', alt: 'Foto' } }],
    }

    const result = await saveArticle(
      null,
      form({ contentType: 'rich_text', body: JSON.stringify(body) }),
    )

    expect(result?.fieldErrors.content).toBe('Envie as imagens pelo botão Imagem.')
  })

  it('PDF novo: original em article-files, prévia em article-previews e remove os antigos', async () => {
    validateUpload.mockImplementation(async (_bucket: string, file: File) => ({
      ok: true,
      file,
      extension: 'pdf',
    }))

    await expect(saveArticle(null, form({ pdf: await pdf(5) }))).rejects.toThrow('NEXT_REDIRECT')

    expect(validateUpload).toHaveBeenCalledWith('article-files', expect.any(File))
    const uploads = store.uploadFile.mock.calls.map(([, bucket, path]) => ({ bucket, path }))
    expect(uploads.map((upload) => upload.bucket)).toEqual(['article-files', 'article-previews'])
    const [original, preview] = uploads
    expect(store.saveArticleRecord.mock.calls[0]?.[1]).toMatchObject({
      full_pdf_path: original?.path,
      preview_pdf_path: preview?.path,
    })
    const previewFile = store.uploadFile.mock.calls[1]?.[3]
    const previewDoc = await PDFDocument.load(new Uint8Array(await previewFile.arrayBuffer()))
    expect(previewDoc.getPageCount()).toBe(2)
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'article-files', [
      `${ID}/completo.pdf`,
    ])
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'article-previews', [
      `${ID}/previa.pdf`,
    ])
  })

  it('PDF protegido por senha é rejeitado sem enviar nada', async () => {
    validateUpload.mockImplementation(async (_bucket: string, file: File) => ({
      ok: true,
      file,
      extension: 'pdf',
    }))

    const result = await saveArticle(null, form({ pdf: await pdf(3, true) }))

    expect(result?.fieldErrors.content).toBe(
      'O PDF está protegido por senha. Envie um arquivo sem senha.',
    )
    expect(store.uploadFile).not.toHaveBeenCalled()
  })

  it('falha no envio da prévia remove o original já enviado', async () => {
    validateUpload.mockImplementation(async (_bucket: string, file: File) => ({
      ok: true,
      file,
      extension: 'pdf',
    }))
    store.uploadFile.mockResolvedValueOnce(null).mockResolvedValueOnce({ message: 'falhou' })

    const result = await saveArticle(null, form({ pdf: await pdf(2) }))

    expect(result?.error).toBe(GENERIC_ERROR_MESSAGE)
    const originalPath = store.uploadFile.mock.calls[0]?.[2]
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'article-files', [originalPath])
    expect(store.saveArticleRecord).not.toHaveBeenCalled()
  })

  it('rich text: body completo, prévia de 3 blocos e PDF gerado em article-files', async () => {
    store.downloadFile.mockResolvedValue(new Uint8Array(SEED_PNG))
    const image = {
      type: 'image',
      attrs: { src: `https://cdn.test/article-images/${ID}/grafico.png`, alt: 'Gráfico' },
    }
    const body = { type: 'doc', content: [...paragraphs(4), image] }

    await expect(
      saveArticle(null, form({ contentType: 'rich_text', body: JSON.stringify(body) })),
    ).rejects.toThrow('NEXT_REDIRECT:/artigos')

    expect(store.downloadFile).toHaveBeenCalledWith(supabase, 'covers', EXISTING.cover_path)
    expect(store.downloadFile).toHaveBeenCalledWith(supabase, 'article-images', `${ID}/grafico.png`)
    const [, bucket, fullPath, file] = store.uploadFile.mock.calls[0] ?? []
    expect(bucket).toBe('article-files')
    expect(file.type).toBe('application/pdf')
    const record = store.saveArticleRecord.mock.calls[0]?.[1]
    expect(record).toMatchObject({
      content_type: 'rich_text',
      full_pdf_path: fullPath,
      body_json: { type: 'doc', content: body.content },
    })
    expect(record.preview_pdf_path).toBeUndefined()
    expect(record.preview_json.content).toHaveLength(3)
    // O artigo era pdf: o PDF e a prévia antigos saem do Storage.
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'article-files', [
      `${ID}/completo.pdf`,
    ])
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'article-previews', [
      `${ID}/previa.pdf`,
    ])
  })

  it('ADM-011 · rich text trocado por PDF: remove PDF gerado e imagens do editor', async () => {
    store.findArticleForEdit.mockResolvedValue({
      ...EXISTING,
      content_type: 'rich_text',
      preview_json: { type: 'doc', content: paragraphs(1) },
      preview_pdf_path: null,
      article_contents: { body_json: { type: 'doc' }, full_pdf_path: `${ID}/gerado.pdf` },
    })
    store.listArticleFiles.mockResolvedValue([`${ID}/grafico.png`])
    validateUpload.mockImplementation(async (_bucket: string, file: File) => ({
      ok: true,
      file,
      extension: 'pdf',
    }))

    await expect(saveArticle(null, form({ pdf: await pdf(3) }))).rejects.toThrow('NEXT_REDIRECT')

    const record = store.saveArticleRecord.mock.calls[0]?.[1]
    expect(record.body_json).toBeUndefined()
    expect(record.preview_json).toBeUndefined()
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'article-files', [`${ID}/gerado.pdf`])
    expect(store.listArticleFiles).toHaveBeenCalledWith(supabase, 'article-images', ID)
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'article-images', [
      `${ID}/grafico.png`,
    ])
  })

  it('PDF continua PDF: não mexe nas imagens do editor', async () => {
    await expect(saveArticle(null, form())).rejects.toThrow('NEXT_REDIRECT')

    expect(store.listArticleFiles).not.toHaveBeenCalled()
  })

  it('slug em uso por outro artigo: erro no campo e remove a capa recém-enviada', async () => {
    store.saveArticleRecord.mockResolvedValue({ code: '23505', message: 'duplicate key' })

    const result = await saveArticle(null, form({ cover: png() }))

    expect(result?.fieldErrors).toEqual({ slug: ARTICLE_MESSAGES.slugTaken })
    const uploadedPath = store.uploadFile.mock.calls[0]?.[2]
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'covers', [uploadedPath])
  })

  it('falha ao salvar: erro genérico e remove a capa recém-enviada', async () => {
    store.saveArticleRecord.mockResolvedValue({ code: 'XX000', message: 'internal' })

    const result = await saveArticle(null, form({ cover: png() }))

    expect(result).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE, fieldErrors: {} })
    const uploadedPath = store.uploadFile.mock.calls[0]?.[2]
    expect(store.removeFiles).toHaveBeenCalledWith(supabase, 'covers', [uploadedPath])
  })
})

describe('deleteArticle', () => {
  beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    requireAdmin.mockResolvedValue({ ok: true, supabase, userId: 'admin' })
    store.deleteArticleRecord.mockResolvedValue(null)
    store.listArticleFiles.mockImplementation(
      async (_supabase: unknown, bucket: string, id: string) => [`${id}/${bucket}.bin`],
    )
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('devolve a negação do requireAdmin sem excluir', async () => {
    requireAdmin.mockResolvedValue({ ok: false, error: 'Sessão expirada' })

    expect(await deleteArticle(ID)).toEqual({ ok: false, error: 'Sessão expirada' })
    expect(store.deleteArticleRecord).not.toHaveBeenCalled()
  })

  it('recusa id inválido', async () => {
    expect(await deleteArticle('nao-e-uuid')).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
    expect(store.deleteArticleRecord).not.toHaveBeenCalled()
  })

  it('exclui o artigo e depois os arquivos dos 4 buckets', async () => {
    expect(await deleteArticle(ID)).toEqual({ ok: true, data: null })

    expect(store.deleteArticleRecord).toHaveBeenCalledWith(supabase, ID)
    for (const bucket of ['covers', 'article-images', 'article-files', 'article-previews'])
      expect(store.removeFiles).toHaveBeenCalledWith(supabase, bucket, [`${ID}/${bucket}.bin`])
  })

  it('falha no banco: erro genérico e nenhum arquivo removido', async () => {
    store.deleteArticleRecord.mockResolvedValue({ code: 'XX000', message: 'internal' })

    expect(await deleteArticle(ID)).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
    expect(store.removeFiles).not.toHaveBeenCalled()
  })
})

describe('uploadArticleImage', () => {
  function imageForm(file: File | null = png()) {
    const formData = new FormData()
    formData.set('articleId', ID)
    if (file) formData.set('image', file)
    return formData
  }

  beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    requireAdmin.mockResolvedValue({ ok: true, supabase, userId: 'admin' })
    store.uploadFile.mockResolvedValue(null)
    store.publicFileUrl.mockImplementation(
      (_supabase: unknown, bucket: string, path: string) => `https://cdn.test/${bucket}/${path}`,
    )
    validateUpload.mockImplementation(async (_bucket: string, file: File) => ({
      ok: true,
      file,
      extension: 'png',
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('devolve a negação do requireAdmin sem enviar nada', async () => {
    requireAdmin.mockResolvedValue({ ok: false, error: 'Sessão expirada' })

    expect(await uploadArticleImage(imageForm())).toEqual({ ok: false, error: 'Sessão expirada' })
    expect(store.uploadFile).not.toHaveBeenCalled()
  })

  it('envia para article-images na pasta do artigo e devolve a URL pública', async () => {
    const result = await uploadArticleImage(imageForm())

    expect(validateUpload).toHaveBeenCalledWith('article-images', expect.any(File))
    const path = store.uploadFile.mock.calls[0]?.[2]
    expect(path).toMatch(new RegExp(`^${ID}/[0-9a-f-]{36}\.png$`))
    expect(result).toEqual({ ok: true, data: { src: `https://cdn.test/article-images/${path}` } })
  })

  it('devolve o erro de validação do arquivo', async () => {
    validateUpload.mockResolvedValue({ ok: false, error: 'Envie uma imagem JPG ou PNG.' })

    expect(await uploadArticleImage(imageForm())).toEqual({
      ok: false,
      error: 'Envie uma imagem JPG ou PNG.',
    })
    expect(store.uploadFile).not.toHaveBeenCalled()
  })

  it('exige o arquivo', async () => {
    expect(await uploadArticleImage(imageForm(null))).toMatchObject({ ok: false })
  })
})
