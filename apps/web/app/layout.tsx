import { fontVariables } from '@rio-negro/ui/fonts'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { connection } from 'next/server'
import type { ReactNode } from 'react'
import { VisitTracker } from '@/components/back-link'
import { SiteFooter } from '@/components/site-footer'
import { StyleNonce } from '@/components/style-nonce'
import { BLOG_DESCRIPTION } from '@/lib/domain/article-description'
import { env } from '@/lib/env'
import './globals.css'

// PUB-010 · URLs de canonical e og:image ficam absolutas a partir de NEXT_PUBLIC_SITE_URL.
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: { default: 'Blog Rio Negro Family Office', template: '%s · Blog Rio Negro Family Office' },
  description: BLOG_DESCRIPTION,
  openGraph: { siteName: 'Blog Rio Negro Family Office', locale: 'pt_BR' },
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
}

// O SiteHeader fica em cada página, porque o item do menu muda com a rota ("Artigos" ou "Voltar",
// PUB-016) e o layout raiz não re-renderiza na navegação. O VisitTracker fica aqui pelo motivo
// oposto: precisa sobreviver à navegação.
export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection()
  const nonce = (await headers()).get('x-nonce') ?? ''

  return (
    <html lang="pt-BR" className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <StyleNonce nonce={nonce} />
        <VisitTracker />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
