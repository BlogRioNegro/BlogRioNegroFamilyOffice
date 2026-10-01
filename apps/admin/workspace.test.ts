import { describe, expect, it } from 'vitest'

describe('pacotes internos', () => {
  it('resolve @rio-negro/db e @rio-negro/ui', async () => {
    await expect(import('@rio-negro/db')).resolves.toBeDefined()
    await expect(import('@rio-negro/ui')).resolves.toBeDefined()
  })
})
