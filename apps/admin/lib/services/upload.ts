import 'server-only'
import { fileTypeFromBuffer } from 'file-type'
import { checkUpload, type Bucket } from '../domain/upload-rules'

export type ValidatedUpload =
  { ok: true; file: Blob; extension: string } | { ok: false; error: string }

/**
 * ADM-006 · Revalida no server o arquivo recebido: tipo real pelos magic bytes, extensão e
 * tamanho. O arquivo devolvido leva o MIME detectado, não o declarado pelo browser.
 */
export async function validateUpload(bucket: Bucket, file: File): Promise<ValidatedUpload> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const detected = await fileTypeFromBuffer(bytes)
  const check = checkUpload(bucket, {
    name: file.name,
    size: file.size,
    detectedMime: detected?.mime ?? null,
  })
  if (!check.ok) return check

  return { ok: true, file: new Blob([bytes], { type: check.mime }), extension: check.extension }
}
