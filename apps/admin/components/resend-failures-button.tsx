'use client'

import { Alert, Button } from '@rio-negro/ui'
import { RotateCcw } from '@rio-negro/ui/icons'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type ResendResult =
  { ok: true; data: { sent: number; failed: number } } | { ok: false; error: string }

type ResendFailuresButtonProps = {
  failedCount: number
  /** Server Action já ligada ao filtro (`resendWebhookFailures.bind(null, articleId)`). */
  action: () => Promise<ResendResult>
  className?: string
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

// ADM-014 · Mostra quantos foram enviados e quantos falharam, e recarrega a lista (status e
// tentativas atualizados).
export function ResendFailuresButton({
  failedCount,
  action,
  className,
}: ResendFailuresButtonProps) {
  const router = useRouter()
  const [result, setResult] = useState<ResendResult | null>(null)
  const [pending, startTransition] = useTransition()

  function resend() {
    startTransition(async () => {
      setResult(await action())
      router.refresh()
    })
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className={className}
        disabled={failedCount === 0}
        loading={pending}
        onClick={resend}
      >
        {pending ? null : <RotateCcw aria-hidden className="size-4" />}
        {failedCount > 0 ? `Reenviar falhas (${failedCount})` : 'Reenviar falhas'}
      </Button>
      {result ? (
        <div className="md:basis-full">
          {result.ok ? (
            <Alert variant="success" title="Reenvio concluído">
              {plural(result.data.sent, 'enviado', 'enviados')} ·{' '}
              {plural(result.data.failed, 'falhou', 'falharam')}
            </Alert>
          ) : (
            <Alert variant="error" title={result.error} />
          )}
        </div>
      ) : null}
    </>
  )
}
