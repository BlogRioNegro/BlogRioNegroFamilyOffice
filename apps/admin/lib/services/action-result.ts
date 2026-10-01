import 'server-only'
import { logger } from './logger'

export const GENERIC_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

export type ActionFailure = { ok: false; error: string }

export type ActionResult<T> = { ok: true; data: T } | ActionFailure

export function failAction(event: string, error: unknown): ActionFailure {
  logger.error(event, { error })
  return { ok: false, error: GENERIC_ERROR_MESSAGE }
}
