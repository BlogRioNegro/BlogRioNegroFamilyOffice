import { Inter, Source_Serif_4 } from 'next/font/google'

// Fontes do design system (DS-003), servidas pelo próprio app (CSP font-src 'self').
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-source-serif',
  display: 'swap',
})

export const fontVariables = `${inter.variable} ${sourceSerif.variable}`
