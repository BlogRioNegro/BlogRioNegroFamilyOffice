import 'server-only'
import { redactPersonalData } from '../domain/redact'

type Level = 'info' | 'warn' | 'error'

// SEC-2 · Erro do banco (PostgREST) traz em `details` a linha recusada, com dados pessoais que o
// redact não reconhece (o nome): dele só saem `code` e `message`.
function isDatabaseError(value: object): value is { code: unknown; message: unknown } {
  return 'code' in value && 'message' in value && 'details' in value
}

function serialize(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value
  if (isDatabaseError(value)) return { code: value.code, message: value.message }
  if (value instanceof Error)
    return { type: value.name, message: value.message, stack: value.stack }
  if (Array.isArray(value)) return value.map(serialize)

  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serialize(entry)]))
}

function write(level: Level, event: string, context: Record<string, unknown> = {}) {
  const line = JSON.stringify({
    level,
    event,
    time: new Date().toISOString(),
    context: redactPersonalData(serialize(context)),
  })
  const stream = level === 'error' ? process.stderr : process.stdout
  stream.write(`${line}\n`)
}

export const logger = {
  info: (event: string, context?: Record<string, unknown>) => write('info', event, context),
  warn: (event: string, context?: Record<string, unknown>) => write('warn', event, context),
  error: (event: string, context?: Record<string, unknown>) => write('error', event, context),
}
