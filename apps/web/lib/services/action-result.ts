import 'server-only'
import { logger } from './logger'

export const GENERIC_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

export type ActionFailure = { ok: false; error: string }

export type ActionResult<T> = { ok: true; data: T } | ActionFailure

/** Loga o detalhe no server e devolve ao client só uma mensagem genérica (SEC-008). */
export function failAction(
  event: string,
  error: unknown,
  message: string = GENERIC_ERROR_MESSAGE,
): ActionFailure {
  logger.error(event, { error })
  return { ok: false, error: message }
}
