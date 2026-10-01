import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { logger } from './logger'

function writeSpies() {
  return {
    stdout: vi.spyOn(process.stdout, 'write').mockReturnValue(true),
    stderr: vi.spyOn(process.stderr, 'write').mockReturnValue(true),
  }
}

function lastWritten(spy: ReturnType<typeof writeSpies>['stdout']): string {
  return String(spy.mock.calls.at(-1)?.[0])
}

describe('logger', () => {
  let spies: ReturnType<typeof writeSpies>

  beforeEach(() => {
    spies = writeSpies()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('escreve uma linha JSON com nível, evento e contexto', () => {
    logger.info('lead.created', { articleId: 'a1' })

    expect(JSON.parse(lastWritten(spies.stdout))).toMatchObject({
      level: 'info',
      event: 'lead.created',
      context: { articleId: 'a1' },
    })
    expect(spies.stderr).not.toHaveBeenCalled()
  })

  it('manda erros para o stderr com nome, mensagem e stack', () => {
    logger.error('lead.persist_failed', { error: new TypeError('falhou') })

    const { context } = JSON.parse(lastWritten(spies.stderr))
    expect(context.error).toMatchObject({ type: 'TypeError', message: 'falhou' })
    expect(context.error.stack).toContain('TypeError: falhou')
  })

  it('não registra dados pessoais do contexto nem da mensagem de erro', () => {
    const error = new Error('Key (email)=(ana@example.com) already exists')

    logger.error('lead.persist_failed', { error, email: 'ana@example.com', ip: '203.0.113.7' })

    const written = lastWritten(spies.stderr)
    expect(written).not.toContain('ana@example.com')
    expect(written).not.toContain('203.0.113.7')
  })

  // SEC-2 · Erro do banco traz em `details` a linha recusada ("Failing row contains (…)").
  it('loga só code e message de erro do banco, sem o details', () => {
    const dbError = {
      code: '23514',
      message: 'new row for relation "leads" violates check constraint "leads_name_check"',
      details: 'Failing row contains (5f1c, Ana Souza, +5511912345678).',
      hint: null,
    }

    logger.error('lead.request_failed', {
      error: dbError,
      cause: Object.assign(new Error(dbError.message), dbError),
    })

    const written = lastWritten(spies.stderr)
    expect(written).not.toContain('Ana Souza')
    expect(written).not.toContain('Failing row')
    expect(JSON.parse(written).context.error).toEqual({ code: '23514', message: dbError.message })
  })
})
