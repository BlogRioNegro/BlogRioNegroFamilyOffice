import type { ReactNode } from 'react'
import { SiteHeader } from './site-header'

// PUB-015 · Layout comum de not-found e error: rótulo opcional, H1, texto e ações.
export function ErrorState({
  label,
  title,
  text,
  children,
}: {
  label?: string
  title: string
  text: string
  children: ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-(--layout-reading) flex-1 flex-col items-start gap-4 px-4 py-16 md:px-0 md:py-24">
        {label ? <p className="text-xs text-text-muted">{label}</p> : null}
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        <p className="mb-4 text-md leading-normal text-text-muted">{text}</p>
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center md:gap-6">
          {children}
        </div>
      </main>
    </>
  )
}
