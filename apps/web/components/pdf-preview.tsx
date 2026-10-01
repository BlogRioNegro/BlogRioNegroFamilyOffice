'use client'

import { Button } from '@rio-negro/ui'
import { ExternalLink, FileText } from '@rio-negro/ui/icons'
import { useSyncExternalStore } from 'react'

const subscribeNever = () => () => {}

// No server e sem JS, tenta embutir: o conteúdo do <object> é o fallback do próprio navegador.
// No client, `pdfViewerEnabled === false` (ex.: Chrome Android) troca direto pelo link.
function useCanEmbedPdf(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => navigator.pdfViewerEnabled !== false,
    () => true,
  )
}

function Fallback({ src }: { src: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center md:px-6 md:py-12">
      <FileText aria-hidden className="size-6" />
      <p className="text-text-muted">Seu navegador não exibe o PDF nesta página.</p>
      <Button asChild variant="link">
        <a href={src} target="_blank" rel="noopener noreferrer">
          Ver prévia
          <ExternalLink aria-hidden className="size-4" />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </Button>
    </div>
  )
}

/** PUB-007 · Prévia pdf (2 páginas, bucket público) embutida, com link quando não embute. */
export function PdfPreview({ src }: { src: string }) {
  const canEmbed = useCanEmbedPdf()
  const frame = 'overflow-hidden rounded-card border border-border bg-surface shadow-card'

  if (!canEmbed) {
    return (
      <div className={frame}>
        <Fallback src={src} />
      </div>
    )
  }

  return (
    <figure className={frame}>
      <figcaption className="border-b border-border px-4 py-3 text-xs text-text-muted">
        Prévia
      </figcaption>
      <object
        data={`${src}#view=FitH`}
        type="application/pdf"
        aria-label="Prévia do artigo em PDF"
        className="block h-110 w-full bg-surface-muted md:h-160"
      >
        <Fallback src={src} />
      </object>
    </figure>
  )
}
