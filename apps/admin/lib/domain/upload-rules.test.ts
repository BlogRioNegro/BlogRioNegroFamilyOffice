import { describe, expect, it } from 'vitest'
import { checkUpload, formatMegabytes, IMAGE_ACCEPT, sizeError, UPLOAD_RULES } from './upload-rules'

const MIB = 1024 * 1024

describe('formatMegabytes', () => {
  it('usa vírgula e uma casa decimal', () => {
    expect(formatMegabytes(24.6 * MIB)).toBe('24,6 MB')
    expect(formatMegabytes(20 * MIB)).toBe('20 MB')
  })
})

describe('sizeError', () => {
  it('aceita exatamente o limite do bucket', () => {
    expect(sizeError('article-files', UPLOAD_RULES['article-files'].maxBytes)).toBeNull()
  })

  it('usa a mensagem da spec 05 para PDF acima do limite', () => {
    expect(sizeError('article-files', 24.6 * MIB)).toBe(
      'O arquivo tem 24,6 MB. Envie um PDF de até 20 MB.',
    )
  })

  it('usa o limite de imagem para a capa', () => {
    expect(sizeError('covers', 2 * MIB + 1)).toBe(
      'O arquivo tem 2,1 MB. Envie uma imagem de até 2 MB.',
    )
  })
})

describe('checkUpload', () => {
  it('aceita PDF real com extensão .pdf', () => {
    expect(
      checkUpload('article-files', {
        name: 'relatorio.PDF',
        size: 10,
        detectedMime: 'application/pdf',
      }),
    ).toEqual({ ok: true, mime: 'application/pdf', extension: 'pdf' })
  })

  it('normaliza .jpeg para .jpg', () => {
    expect(
      checkUpload('covers', { name: 'capa.jpeg', size: 10, detectedMime: 'image/jpeg' }),
    ).toEqual({
      ok: true,
      mime: 'image/jpeg',
      extension: 'jpg',
    })
  })

  it('rejeita executável renomeado para .pdf', () => {
    expect(
      checkUpload('article-files', {
        name: 'relatorio.pdf',
        size: 10,
        detectedMime: 'application/x-msdownload',
      }),
    ).toEqual({ ok: false, error: 'Envie um arquivo PDF.' })
  })

  it('rejeita arquivo sem tipo reconhecido', () => {
    expect(checkUpload('covers', { name: 'capa.png', size: 10, detectedMime: null })).toEqual({
      ok: false,
      error: 'Envie uma imagem JPG ou PNG.',
    })
  })

  it('rejeita extensão que não bate com o conteúdo', () => {
    expect(
      checkUpload('covers', { name: 'capa.pdf', size: 10, detectedMime: 'image/png' }),
    ).toEqual({
      ok: false,
      error: 'Envie uma imagem JPG ou PNG.',
    })
  })

  it('rejeita WebP na capa e no editor', () => {
    for (const bucket of ['covers', 'article-images'] as const)
      expect(
        checkUpload(bucket, { name: 'foto.webp', size: 10, detectedMime: 'image/webp' }),
      ).toEqual({ ok: false, error: 'Envie uma imagem JPG ou PNG.' })
  })

  it('rejeita PDF no bucket de imagens', () => {
    expect(
      checkUpload('article-images', { name: 'a.pdf', size: 10, detectedMime: 'application/pdf' }),
    ).toMatchObject({ ok: false })
  })

  it('rejeita acima do limite antes de olhar o tipo', () => {
    expect(
      checkUpload('covers', { name: 'capa.png', size: 3 * MIB, detectedMime: 'image/png' }),
    ).toEqual({ ok: false, error: 'O arquivo tem 3 MB. Envie uma imagem de até 2 MB.' })
  })
})

describe('IMAGE_ACCEPT', () => {
  it('lista só JPEG e PNG', () => {
    expect(IMAGE_ACCEPT).toBe('image/jpeg,image/png')
  })
})
