// DATA-007 · ADM-006 · Constante única dos limites de upload, com os mesmos números dos buckets
// (migration storage_buckets; ADR 0022). Mudar um limite exige migration e mudança aqui.

const MIB = 1024 * 1024

const IMAGE = {
  maxBytes: 2 * MIB,
  extensions: { 'image/jpeg': ['jpg', 'jpeg'], 'image/png': ['png'] },
  typeMessage: 'Envie uma imagem JPG ou PNG.',
  noun: 'uma imagem',
}

const PDF = {
  maxBytes: 20 * MIB,
  extensions: { 'application/pdf': ['pdf'] },
  typeMessage: 'Envie um arquivo PDF.',
  noun: 'um PDF',
}

export const UPLOAD_RULES = {
  covers: IMAGE,
  'article-images': IMAGE,
  'article-previews': PDF,
  'article-files': PDF,
} as const

export type Bucket = keyof typeof UPLOAD_RULES

/** Atributo `accept` dos campos de imagem (capa e editor). */
export const IMAGE_ACCEPT = Object.keys(IMAGE.extensions).join(',')

/** Teto do corpo do formulário de artigo: capa + PDF, com folga para os campos e o multipart. */
export const ARTICLE_FORM_MAX_BYTES = IMAGE.maxBytes + PDF.maxBytes + MIB

const megabytes = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

/**
 * Tamanho em MB (base 1024, como o limite do bucket), com vírgula decimal: "24,6 MB". Arredonda
 * para cima, para um arquivo 1 byte acima do limite não aparecer com o mesmo número do limite.
 */
export function formatMegabytes(bytes: number): string {
  return `${megabytes.format(Math.ceil((bytes / MIB) * 10) / 10)} MB`
}

/** Erro de tamanho, ou null se o arquivo cabe no limite do bucket. */
export function sizeError(bucket: Bucket, bytes: number): string | null {
  const rule = UPLOAD_RULES[bucket]
  if (bytes <= rule.maxBytes) return null
  return `O arquivo tem ${formatMegabytes(bytes)}. Envie ${rule.noun} de até ${formatMegabytes(rule.maxBytes)}.`
}

export type UploadCheck =
  { ok: true; mime: string; extension: string } | { ok: false; error: string }

/**
 * ADM-006 · Aceita o arquivo só se o tipo real (magic bytes) é permitido no bucket, a extensão do
 * nome bate com esse tipo e o tamanho cabe no limite. Um `.exe` renomeado para `.pdf` falha aqui.
 */
export function checkUpload(
  bucket: Bucket,
  file: { name: string; size: number; detectedMime: string | null },
): UploadCheck {
  const rule = UPLOAD_RULES[bucket]
  const tooBig = sizeError(bucket, file.size)
  if (tooBig) return { ok: false, error: tooBig }

  const allowed: Record<string, readonly string[]> = rule.extensions
  const extensions = file.detectedMime ? allowed[file.detectedMime] : undefined
  const nameExtension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!file.detectedMime || !extensions?.includes(nameExtension)) {
    return { ok: false, error: rule.typeMessage }
  }
  return { ok: true, mime: file.detectedMime, extension: extensions[0] ?? nameExtension }
}
