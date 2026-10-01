import { fontVariables } from '@rio-negro/ui/fonts'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { StyleNonce } from '@/components/style-nonce'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rio Negro · Admin',
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection()
  const nonce = (await headers()).get('x-nonce') ?? ''

  return (
    <html lang="pt-BR" className={fontVariables}>
      <body>
        <StyleNonce nonce={nonce} />
        {children}
      </body>
    </html>
  )
}
