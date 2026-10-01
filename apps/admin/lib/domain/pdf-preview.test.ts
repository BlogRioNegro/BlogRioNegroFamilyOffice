import { PDFDocument, PDFName } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { createPdfPreview, PDF_MESSAGES } from './pdf-preview'

async function pdfWithPages(count: number, encrypted = false): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (let page = 1; page <= count; page += 1) doc.addPage().drawText(`Página ${page}`)
  // Um dicionário /Encrypt no trailer basta para o PDF ser tratado como protegido por senha.
  if (encrypted) {
    doc.context.trailerInfo.Encrypt = doc.context.register(
      doc.context.obj({ Filter: PDFName.of('Standard') }),
    )
  }
  return doc.save()
}

async function pageCount(bytes: Uint8Array): Promise<number> {
  return (await PDFDocument.load(bytes)).getPageCount()
}

describe('createPdfPreview', () => {
  it('copia só as 2 primeiras páginas', async () => {
    const result = await createPdfPreview(await pdfWithPages(5))

    expect(result.ok).toBe(true)
    if (result.ok) expect(await pageCount(result.preview)).toBe(2)
  })

  it('PDF de 1 página gera prévia de 1 página', async () => {
    const result = await createPdfPreview(await pdfWithPages(1))

    expect(result.ok).toBe(true)
    if (result.ok) expect(await pageCount(result.preview)).toBe(1)
  })

  it('rejeita PDF protegido por senha com mensagem clara', async () => {
    expect(await createPdfPreview(await pdfWithPages(3, true))).toEqual({
      ok: false,
      error: PDF_MESSAGES.encrypted,
    })
  })

  it('rejeita PDF corrompido', async () => {
    const corrupted = new TextEncoder().encode('%PDF-1.7\nisto não é um PDF de verdade')

    expect(await createPdfPreview(corrupted)).toEqual({ ok: false, error: PDF_MESSAGES.unreadable })
  })
})
