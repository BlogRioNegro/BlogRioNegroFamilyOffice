import { fontVariables } from '@rio-negro/ui/fonts'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { StyleNonce } from '@/components/style-nonce'
import { BLOG_DESCRIPTION } from '@/lib/domain/article-description'
import { env } from '@/lib/env'
import './globals.css'

// PUB-010 · URLs de canonical e og:image ficam absolutas a partir de NEXT_PUBLIC_SITE_URL.
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: { default: 'Rio Negro Investimentos', template: '%s · Rio Negro Investimentos' },
  description: BLOG_DESCRIPTION,
  openGraph: { siteName: 'Rio Negro Investimentos', locale: 'pt_BR' },
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
}

// O SiteHeader fica em cada segmento, porque o link ativo muda com a rota e o layout raiz
// não re-renderiza na navegação.
export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection()
  const nonce = (await headers()).get('x-nonce') ?? ''

  return (
    <html lang="pt-BR" className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <StyleNonce nonce={nonce} />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
