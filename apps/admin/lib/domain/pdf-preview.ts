import { PDFDocument } from 'pdf-lib'

// ADM-007 · ADR 0008 · Prévia pública do artigo pdf: as 2 primeiras páginas copiadas para um PDF
// novo. O original nunca vai para um bucket público (ADR 0007).

export const PREVIEW_PAGES = 2

export const PDF_MESSAGES = {
  encrypted: 'O PDF está protegido por senha. Envie um arquivo sem senha.',
  unreadable: 'Não foi possível ler o PDF. Confira se o arquivo não está corrompido.',
} as const

export type PdfPreview = { ok: true; preview: Uint8Array } | { ok: false; error: string }

// O pdf-lib é compilado para ES5 e o `instanceof EncryptedPDFError` não funciona: a proteção por
// senha é lida de `isEncrypted`, carregando com `ignoreEncryption`.
async function copyFirstPages(original: Uint8Array): Promise<Uint8Array | null> {
  const source = await PDFDocument.load(original, { ignoreEncryption: true })
  if (source.isEncrypted) return null

  const pageCount = source.getPageCount()
  if (pageCount === 0) throw new Error('PDF sem páginas')

  const preview = await PDFDocument.create()
  const indices = Array.from({ length: Math.min(PREVIEW_PAGES, pageCount) }, (_, index) => index)
  for (const page of await preview.copyPages(source, indices)) preview.addPage(page)
  return preview.save()
}

export async function createPdfPreview(original: Uint8Array): Promise<PdfPreview> {
  try {
    const preview = await copyFirstPages(original)
    return preview ? { ok: true, preview } : { ok: false, error: PDF_MESSAGES.encrypted }
  } catch {
    return { ok: false, error: PDF_MESSAGES.unreadable }
  }
}
