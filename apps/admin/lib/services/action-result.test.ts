import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { failAction, GENERIC_ERROR_MESSAGE } from './action-result'

function spyStderr() {
  return vi.spyOn(process.stderr, 'write').mockReturnValue(true)
}

describe('failAction', () => {
  let stderr: ReturnType<typeof spyStderr>

  beforeEach(() => {
    stderr = spyStderr()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('devolve só a mensagem genérica, sem stack, SQL nem dado de lead', () => {
    const error = new Error('insert into leads (email) values ($1): Key (email)=(ana@example.com)')

    const result = failAction('lead.persist_failed', error)

    expect(result).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
    expect(JSON.stringify(result)).not.toMatch(/insert into|ana@example\.com|\.ts:\d+/)
  })

  it('registra o detalhe no log do server', () => {
    failAction('lead.persist_failed', new Error('insert into leads falhou'))

    const written = String(stderr.mock.calls.at(-1)?.[0])
    expect(written).toContain('lead.persist_failed')
    expect(written).toContain('insert into leads falhou')
  })
})
