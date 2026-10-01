// LEAD-006 · SEC-004 · IP do cliente para o rate limit e o `ip_hash`: primeiro valor de
// `x-forwarded-for`, depois `x-real-ip`, por fim "unknown". O IP só é usado em hash (HMAC).
// O header confiável no proxy da StayCloud ainda precisa ser confirmado (F3-002).

export const UNKNOWN_IP = 'unknown'

type HeaderReader = { get(name: string): string | null }

export function clientIp(headers: HeaderReader): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded

  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return UNKNOWN_IP
}
