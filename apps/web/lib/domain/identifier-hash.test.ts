import { describe, expect, it } from 'vitest'
import { hashIdentifier } from './identifier-hash'

describe('hashIdentifier', () => {
  it('produz o HMAC-SHA256 do vetor de teste da RFC 4231 (caso 2)', async () => {
    const hash = await hashIdentifier('what do ya want for nothing?', 'Jefe')

    expect(hash).toBe('5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843')
  })

  it('é determinístico para o mesmo valor e segredo', async () => {
    const first = await hashIdentifier('203.0.113.7', 'segredo')
    const second = await hashIdentifier('203.0.113.7', 'segredo')

    expect(first).toBe(second)
  })

  it('muda quando o segredo muda', async () => {
    const withA = await hashIdentifier('ana@example.com', 'segredo-a')
    const withB = await hashIdentifier('ana@example.com', 'segredo-b')

    expect(withA).not.toBe(withB)
  })

  it('não contém o identificador em claro', async () => {
    const hash = await hashIdentifier('203.0.113.7', 'segredo')

    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hash).not.toContain('203.0.113.7')
  })
})
