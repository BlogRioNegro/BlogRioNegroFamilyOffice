// Datas do site no formato "15 set. 2026", no fuso de Brasília (spec 03, Tipografia).
const MONTHS = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
]

const parts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Sao_Paulo',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
})

export function formatPublishedDate(iso: string): string {
  const values = Object.fromEntries(
    parts.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  )
  return `${values.day} ${MONTHS[Number(values.month) - 1]} ${values.year}`
}
