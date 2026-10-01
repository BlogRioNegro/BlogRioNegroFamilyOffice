import { describe, expect, it } from 'vitest'
import {
  COVER_MAX_WIDTH,
  COVER_SOURCE_MAX_BYTES,
  coverSize,
  coverSourceError,
  jpegFileName,
} from './cover-image'
import { UPLOAD_RULES } from './upload-rules'

const MIB = 1024 * 1024

describe('coverSourceError', () => {
  it('aceita até 5 MB, acima do limite do bucket', () => {
    expect(COVER_SOURCE_MAX_BYTES).toBeGreaterThan(UPLOAD_RULES.covers.maxBytes)
    expect(coverSourceError(COVER_SOURCE_MAX_BYTES)).toBeNull()
    expect(coverSourceError(3 * MIB)).toBeNull()
  })

  it('recusa acima de 5 MB com a mensagem de tamanho', () => {
    expect(coverSourceError(6.2 * MIB)).toBe('O arquivo tem 6,2 MB. Envie uma imagem de até 5 MB.')
  })
})

describe('coverSize', () => {
  it('reduz proporcionalmente até 1920 px de largura', () => {
    expect(coverSize(4000, 2250)).toEqual({ width: COVER_MAX_WIDTH, height: 1080 })
    expect(coverSize(3000, 2000)).toEqual({ width: 1920, height: 1280 })
  })

  it('não amplia imagem menor', () => {
    expect(coverSize(1280, 720)).toEqual({ width: 1280, height: 720 })
  })
})

describe('jpegFileName', () => {
  it('troca a extensão por .jpg', () => {
    expect(jpegFileName('capa.PNG')).toBe('capa.jpg')
    expect(jpegFileName('foto.final.jpeg')).toBe('foto.final.jpg')
    expect(jpegFileName('sem-extensao')).toBe('sem-extensao.jpg')
    expect(jpegFileName('.png')).toBe('capa.jpg')
  })
})
