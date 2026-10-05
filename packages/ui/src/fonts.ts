import { Roboto, Roboto_Slab } from 'next/font/google'

// Fontes do guia da marca (DS-003, ADR 0045), servidas pelo próprio app (CSP font-src 'self').
// Roboto Slab: títulos e subtítulos. Roboto: todo o resto. As duas são variáveis (sem `weight`),
// então os pesos 200, 300 e 500 da ADR 0046 já vêm no mesmo arquivo.
const roboto = Roboto({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-roboto',
  display: 'swap',
})

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-roboto-slab',
  display: 'swap',
})

export const fontVariables = `${roboto.variable} ${robotoSlab.variable}`
