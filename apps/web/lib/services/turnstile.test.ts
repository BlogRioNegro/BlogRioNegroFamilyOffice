import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SITEVERIFY_URL, TURNSTILE_TIMEOUT_MS, verifyTurnstile } from './turnstile'

// Chave secreta de teste oficial do Turnstile que sempre recusa (docs da Cloudflare).
const { SECRET } = vi.hoisted(() => ({ SECRET: '2x0000000000000000000000000000000AA' }))

vi.mock('../env', () => ({ env: { TURNSTILE_SECRET_KEY: SECRET } }))

const fetchMock = vi.fn<typeof fetch>()

// Respostas no formato documentado do siteverify.
const siteverify = (success: boolean, codes: string[] = []) =>
  Response.json({ success, 'error-codes': codes })

describe('verifyTurnstile', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(process.stdout, 'write').mockReturnValue(true)
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    fetchMock.mockReset()
  })

  it('token ausente é recusado sem chamar a Cloudflare', async () => {
    expect(await verifyTurnstile('')).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envia o secret e o token ao siteverify, sem o IP', async () => {
    fetchMock.mockResolvedValue(siteverify(true))

    expect(await verifyTurnstile('token-valido')).toBe(true)
    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe(SITEVERIFY_URL)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ secret: SECRET, response: 'token-valido' })
  })

  it('token inválido é recusado', async () => {
    fetchMock.mockResolvedValue(siteverify(false, ['invalid-input-response']))

    expect(await verifyTurnstile('token-invalido')).toBe(false)
  })

  it('token reutilizado é recusado', async () => {
    fetchMock.mockResolvedValue(siteverify(false, ['timeout-or-duplicate']))

    expect(await verifyTurnstile('token-ja-usado')).toBe(false)
  })

  it('timeout do siteverify conta como recusa', async () => {
    fetchMock.mockImplementation(
      (_, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )

    expect(await verifyTurnstile('token', 50)).toBe(false)
    expect(TURNSTILE_TIMEOUT_MS).toBe(5_000)
  })

  it('resposta fora do formato ou erro de rede contam como recusa', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ ok: true }))
    expect(await verifyTurnstile('token')).toBe(false)

    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'))
    expect(await verifyTurnstile('token')).toBe(false)
  })
})
