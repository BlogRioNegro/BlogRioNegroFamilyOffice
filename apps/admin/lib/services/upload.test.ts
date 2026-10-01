import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateUpload } from './upload'

// ADM-006 · Magic bytes com arquivos reais do seed (supabase/storage).
const STORAGE = path.resolve(import.meta.dirname, '../../../../supabase/storage')
const PNG = readFileSync(
  path.join(
    STORAGE,
    'covers/11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
  ),
)
const PDF = readFileSync(
  path.join(
    STORAGE,
    'article-previews/22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf',
  ),
)
// Cabeçalho DOS/PE de um executável do Windows.
const EXE = Buffer.concat([
  Buffer.from('MZ'),
  Buffer.alloc(62),
  Buffer.from('PE\0\0'),
  Buffer.alloc(200),
])

function file(bytes: Uint8Array, name: string, type: string) {
  return new File([new Uint8Array(bytes)], name, { type })
}

describe('validateUpload', () => {
  it('aceita a capa PNG e usa o MIME detectado', async () => {
    const result = await validateUpload('covers', file(PNG, 'capa.png', 'application/octet-stream'))

    expect(result).toMatchObject({ ok: true, extension: 'png' })
    expect(result.ok && result.file.type).toBe('image/png')
  })

  it('aceita o PDF', async () => {
    expect(
      await validateUpload('article-files', file(PDF, 'relatorio.pdf', 'application/pdf')),
    ).toMatchObject({
      ok: true,
      extension: 'pdf',
    })
  })

  it('rejeita .exe renomeado para .pdf, mesmo com MIME declarado de PDF', async () => {
    expect(
      await validateUpload('article-files', file(EXE, 'relatorio.pdf', 'application/pdf')),
    ).toEqual({
      ok: false,
      error: 'Envie um arquivo PDF.',
    })
  })

  it('rejeita PNG enviado como PDF', async () => {
    expect(
      await validateUpload('article-files', file(PNG, 'relatorio.pdf', 'application/pdf')),
    ).toMatchObject({
      ok: false,
    })
  })

  it('rejeita acima do limite do bucket', async () => {
    const big = new Uint8Array(20 * 1024 * 1024 + 1)
    big.set(PDF.subarray(0, 1024))

    expect(
      await validateUpload('article-files', file(big, 'grande.pdf', 'application/pdf')),
    ).toEqual({
      ok: false,
      error: 'O arquivo tem 20,1 MB. Envie um PDF de até 20 MB.',
    })
  })
})
