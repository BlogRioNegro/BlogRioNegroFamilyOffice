'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../cn'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  title: string
  description?: string
  /** Ações do rodapé (ex.: Cancelar + primário). */
  footer?: ReactNode
}

// Foco preso, Esc e clique no fundo fecham, e o foco volta ao gatilho (Radix).
// 480 px no desktop, tela cheia abaixo de 768 px.
export function DialogContent({
  className,
  title,
  description,
  footer,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-0 z-50 flex flex-col gap-4 overflow-y-auto bg-surface p-4 md:inset-auto md:p-6 md:top-1/2 md:left-1/2 md:max-h-[90vh] md:w-[480px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card md:shadow-modal',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-4">
            <DialogPrimitive.Title className="pt-2 text-xl font-semibold text-text">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-sm text-text-muted">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close className="-mr-2 inline-flex size-(--control-height) shrink-0 items-center justify-center rounded-control text-text hover:bg-surface-muted">
            <X aria-hidden className="size-5" />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        </div>
        {children}
        {footer ? (
          <div className="mt-auto flex gap-3 *:flex-1 md:justify-end md:*:flex-none">{footer}</div>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
