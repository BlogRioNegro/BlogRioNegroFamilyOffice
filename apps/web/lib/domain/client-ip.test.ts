import { describe, expect, it } from 'vitest'
import { clientIp, UNKNOWN_IP } from './client-ip'

describe('clientIp', () => {
  it('usa o primeiro valor de x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1, 10.0.0.2',
      'x-real-ip': '198.51.100.9',
    })

    expect(clientIp(headers)).toBe('203.0.113.7')
  })

  it('cai em x-real-ip sem x-forwarded-for', () => {
    expect(clientIp(new Headers({ 'x-real-ip': ' 198.51.100.9 ' }))).toBe('198.51.100.9')
  })

  it('cai em x-real-ip quando x-forwarded-for está vazio', () => {
    const headers = new Headers({ 'x-forwarded-for': ' , 10.0.0.1', 'x-real-ip': '198.51.100.9' })

    expect(clientIp(headers)).toBe('198.51.100.9')
  })

  it('usa "unknown" sem nenhum dos dois headers', () => {
    expect(clientIp(new Headers())).toBe(UNKNOWN_IP)
  })
})
