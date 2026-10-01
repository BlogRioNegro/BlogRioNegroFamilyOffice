import { describe, expect, it } from 'vitest'
import { redactPersonalData } from './redact'

describe('redactPersonalData', () => {
  it('mascara chaves de dado pessoal em qualquer nível', () => {
    const result = redactPersonalData({
      lead: { name: 'Ana Souza', Email: 'ana@example.com', telefone: '+5511912345678' },
      ip: '203.0.113.7',
      ip_hash: 'abc123',
    })

    expect(result).toEqual({
      lead: { name: '[redacted]', Email: '[redacted]', telefone: '[redacted]' },
      ip: '[redacted]',
      ip_hash: 'abc123',
    })
  })

  it('mascara e-mail, IP e telefone dentro de mensagens', () => {
    const message =
      'Key (email)=(ana@example.com) from 203.0.113.7 and 2001:db8:85a3::8a2e:370:7334, tel +5511912345678 ou (11) 91234-5678'

    expect(redactPersonalData(message)).toBe(
      'Key (email)=([redacted]) from [redacted] and [redacted], tel [redacted] ou [redacted]',
    )
  })

  it('preserva horários, UUIDs e valores não pessoais', () => {
    const value = {
      event: 'lead.persist_failed at 12:30:45',
      articleId: '3f2b8c1e-9d4a-4e7b-8c2f-1a2b3c4d5e6f',
      attempts: 3,
      ok: false,
      missing: null,
    }

    expect(redactPersonalData(value)).toEqual(value)
  })

  it('percorre arrays', () => {
    expect(redactPersonalData(['ana@example.com', 1])).toEqual(['[redacted]', 1])
  })
})
