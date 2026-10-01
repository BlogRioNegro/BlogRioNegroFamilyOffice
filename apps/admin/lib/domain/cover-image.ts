import { formatMegabytes } from './upload-rules'

// ADM-006 · ADR 0041 · A capa escolhida pode ter até 5 MB; o browser a reduz (largura máxima e
// JPEG) antes do envio, e o que chega ao server continua no limite do bucket `covers`.

const MIB = 1024 * 1024

export const COVER_SOURCE_MAX_BYTES = 5 * MIB
export const COVER_MAX_WIDTH = 1920
/** Qualidades tentadas em ordem até o JPEG caber no limite do bucket. */
export const COVER_JPEG_QUALITIES = [0.85, 0.75, 0.6] as const

export const COVER_TOO_LARGE_AFTER_OPTIMIZE =
  'Não foi possível reduzir a imagem para o limite de envio. Escolha uma imagem menor.'

/** Erro do arquivo escolhido acima de 5 MB, ou null se ele pode ser otimizado. */
export function coverSourceError(bytes: number): string | null {
  if (bytes <= COVER_SOURCE_MAX_BYTES) return null
  return `O arquivo tem ${formatMegabytes(bytes)}. Envie uma imagem de até ${formatMegabytes(COVER_SOURCE_MAX_BYTES)}.`
}

/** Dimensões finais: reduz proporcionalmente até a largura máxima; nunca amplia. */
export function coverSize(width: number, height: number): { width: number; height: number } {
  if (width <= COVER_MAX_WIDTH) return { width, height }
  return { width: COVER_MAX_WIDTH, height: Math.round((height * COVER_MAX_WIDTH) / width) }
}

/** Nome do arquivo otimizado: mesmo nome com extensão `.jpg` (o server confere a extensão). */
export function jpegFileName(name: string): string {
  const base = name.replace(/\.[^./\\]*$/, '')
  return `${base || 'capa'}.jpg`
}
