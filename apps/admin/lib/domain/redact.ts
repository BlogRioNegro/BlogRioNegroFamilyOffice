const REDACTED = '[redacted]'

const PERSONAL_KEYS = new Set([
  'name',
  'nome',
  'fullname',
  'email',
  'phone',
  'telefone',
  'ip',
  'ipaddress',
])

const PERSONAL_PATTERNS = [
  /[^\s@"'<>()=]+@[^\s@"'<>()=]+\.[^\s@"'<>()=]+/g,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  /\b(?:[0-9a-f]{0,4}:){3,7}[0-9a-f]{0,4}\b/gi,
  /\+\d{8,15}\b/g,
  /\(\d{2}\)\s?9?\d{4}-?\d{4}/g,
]

function isPersonalKey(key: string): boolean {
  return PERSONAL_KEYS.has(key.toLowerCase().replace(/[_-]/g, ''))
}

function redactString(value: string): string {
  return PERSONAL_PATTERNS.reduce((text, pattern) => text.replace(pattern, REDACTED), value)
}

export function redactPersonalData(value: unknown): unknown {
  if (typeof value === 'string') return redactString(value)
  if (Array.isArray(value)) return value.map(redactPersonalData)
  if (value === null || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      isPersonalKey(key) ? REDACTED : redactPersonalData(entry),
    ]),
  )
}
