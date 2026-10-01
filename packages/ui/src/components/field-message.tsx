import { CircleAlert } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '../cn'

type FieldMessageProps = ComponentProps<'p'> & {
  /** help explica o formato; error diz o que corrigir (sempre com ícone, não só cor). */
  variant?: 'help' | 'error'
}

export function FieldMessage({
  className,
  variant = 'help',
  children,
  ...props
}: FieldMessageProps) {
  if (variant === 'error') {
    return (
      <p className={cn('flex items-start gap-1 text-xs text-error', className)} {...props}>
        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>{children}</span>
      </p>
    )
  }

  return (
    <p className={cn('text-xs text-text-muted', className)} {...props}>
      {children}
    </p>
  )
}
