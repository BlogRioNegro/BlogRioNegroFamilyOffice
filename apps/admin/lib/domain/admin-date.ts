// Datas do painel no fuso de Brasília (spec 05, UI · Estrutura): publicação em dd/mm/aaaa; leads
// em dd/mm/aaaa hh:mm.
const TIME_ZONE = 'America/Sao_Paulo'
// Brasília não tem horário de verão desde 2019: o offset é fixo.
const OFFSET = '-03:00'

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

// en-CA formata a data como aaaa-mm-dd, o valor do <input type="date">.
const isoDateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE })

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

const shortTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Hora hh:mm em Brasília. */
export function formatTime(iso: string): string {
  return shortTimeFormat.format(new Date(iso))
}

/** Data e hora do lead: dd/mm/aaaa hh:mm. */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`
}

/** Valor aaaa-mm-dd do campo de data, no dia de Brasília. */
export function dateInputValue(date: Date): string {
  return isoDateFormat.format(date)
}

/**
 * ADM-010 · Instante de publicação a partir da data do formulário. Mantém o instante anterior se
 * o dia não mudou; senão usa o dia escolhido com o horário de agora, para a ordem entre artigos
 * do mesmo dia seguir a ordem em que foram salvos.
 */
export function publishedAtFromDate(date: string, previous: string | null, now: Date): string {
  if (previous && dateInputValue(new Date(previous)) === date) return previous
  return new Date(`${date}T${timeFormat.format(now)}${OFFSET}`).toISOString()
}
