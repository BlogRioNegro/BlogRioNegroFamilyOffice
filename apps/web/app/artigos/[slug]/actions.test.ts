import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleDownloadRequest } from '@/lib/services/article-download'
import { requestArticleDownload } from './actions'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }),
}))
vi.mock('next/server', () => ({ after: vi.fn() }))
vi.mock('@/lib/services/article-download', () => ({ handleDownloadRequest: vi.fn() }))

const handleMock = vi.mocked(handleDownloadRequest)

describe('requestArticleDownload', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('delega ao serviço com o IP do cliente e o after do Next', async () => {
    const { after } = await import('next/server')
    handleMock.mockResolvedValue({ ok: true, data: { url: 'https://storage.example/assinada' } })

    const input = { name: 'qualquer' }
    const result = await requestArticleDownload(input)

    expect(result).toEqual({ ok: true, data: { url: 'https://storage.example/assinada' } })
    expect(handleMock).toHaveBeenCalledWith(input, { ip: '203.0.113.7', schedule: after })
  })
})
