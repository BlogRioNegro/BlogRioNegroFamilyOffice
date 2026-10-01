// LEAD-001 · Máscara do telefone no campo: `(99) 99999-9999` (celular) ou `(99) 9999-9999` (fixo).
// O autocomplete `tel` pode trazer o +55: ele é removido para caber na máscara.

export function maskPhone(value: string): string {
  const all = value.replace(/\D/g, '')
  const digits = (all.length > 11 && all.startsWith('55') ? all.slice(2) : all).slice(0, 11)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  const ddd = digits.slice(0, 2)
  const number = digits.slice(2)
  if (number.length <= 4) return `(${ddd}) ${number}`
  const split = digits.length === 11 ? 5 : 4
  return `(${ddd}) ${number.slice(0, split)}-${number.slice(split)}`
}
