'use client'

import { Alert, Button, Dialog, DialogClose, DialogContent, DialogTrigger } from '@rio-negro/ui'
import { Trash2 } from '@rio-negro/ui/icons'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'

type DeleteResult = { ok: true } | { ok: false; error: string }

type ConfirmDeleteDialogProps = {
  /** Botão que abre a confirmação. */
  trigger: ReactNode
  title: string
  message: string
  confirmLabel: string
  /** Server Action já ligada ao registro (`action.bind(null, id)`). */
  action: () => Promise<DeleteResult>
}

// Spec 05, UI · Estrutura: exclusão confirmada em Dialog, primário com lixeira e "Cancelar".
// Depois de excluir, a lista do server é recarregada.
export function ConfirmDeleteDialog({
  trigger,
  title,
  message,
  confirmLabel,
  action,
}: ConfirmDeleteDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function confirm() {
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        setError(null)
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title={title}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="secondary" disabled={pending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button loading={pending} onClick={confirm}>
              {pending ? null : <Trash2 aria-hidden className="size-5" />}
              {confirmLabel}
            </Button>
          </>
        }
      >
        {error ? <Alert variant="error" title={error} /> : null}
        <p className="text-sm leading-normal text-text">{message}</p>
      </DialogContent>
    </Dialog>
  )
}
