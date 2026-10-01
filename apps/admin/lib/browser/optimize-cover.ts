import {
  COVER_JPEG_QUALITIES,
  COVER_TOO_LARGE_AFTER_OPTIMIZE,
  coverSize,
  jpegFileName,
} from '../domain/cover-image'
import { UPLOAD_RULES } from '../domain/upload-rules'

// ADR 0041 · Roda só no browser (canvas): reduz a capa a 1920 px de largura e a recomprime em
// JPEG antes do envio. O server revalida tipo real e tamanho como qualquer upload (ADR 0034).

export type OptimizedCover = { ok: true; file: File } | { ok: false; error: string }

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

export async function optimizeCover(file: File): Promise<OptimizedCover> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null)
  if (!bitmap) return { ok: false, error: UPLOAD_RULES.covers.typeMessage }

  const { width, height } = coverSize(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return { ok: false, error: COVER_TOO_LARGE_AFTER_OPTIMIZE }
  // JPEG não tem transparência: o fundo transparente de um PNG vira branco, não preto.
  context.fillStyle = 'white'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  for (const quality of COVER_JPEG_QUALITIES) {
    const blob = await toJpeg(canvas, quality)
    if (blob && blob.size <= UPLOAD_RULES.covers.maxBytes) {
      return {
        ok: true,
        file: new File([blob], jpegFileName(file.name), { type: 'image/jpeg' }),
      }
    }
  }
  return { ok: false, error: COVER_TOO_LARGE_AFTER_OPTIMIZE }
}
