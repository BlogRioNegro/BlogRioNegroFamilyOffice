import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'

export default function ArticlesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader current="artigos" />
      {children}
    </>
  )
}
