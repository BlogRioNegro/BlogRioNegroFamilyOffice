import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { signWebhook, WEBHOOK_TIMEOUT_MS } from './lead-webhook'

vi.mock('../env', () => ({ env: {} }))

// Vetor compartilhado com o apps/web (ADR 0032): a mesma entrada gera a mesma assinatura.
const vector = z
  .object({ secret: z.string(), timestamp: z.string(), body: z.string(), signature: z.string() })
  .parse(
    JSON.parse(
      readFileSync(
        new URL('../../../../tests/fixtures/lead-webhook-signature.json', import.meta.url),
        'utf8',
      ),
    ),
  )

describe('signWebhook', () => {
  it('reproduz a assinatura do vetor fixo', async () => {
    expect(await signWebhook(vector.secret, vector.timestamp, vector.body)).toBe(vector.signature)
  })

  it('muda se o timestamp ou o corpo mudarem', async () => {
    expect(await signWebhook(vector.secret, '1790000001', vector.body)).not.toBe(vector.signature)
    expect(await signWebhook(vector.secret, vector.timestamp, `${vector.body} `)).not.toBe(
      vector.signature,
    )
  })

  it('usa o timeout de 5 s da spec', () => {
    expect(WEBHOOK_TIMEOUT_MS).toBe(5_000)
  })
})
