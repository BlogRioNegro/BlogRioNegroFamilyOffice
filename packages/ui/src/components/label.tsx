import type { ComponentProps } from 'react'
import { cn } from '../cn'

type LabelProps = ComponentProps<'label'> & {
  /** Acrescenta "(opcional)" em texto secundário. */
  optional?: boolean
}

export function Label({ className, optional = false, children, ...props }: LabelProps) {
  return (
    <label className={cn('block text-xs font-medium text-text', className)} {...props}>
      {children}
      {optional ? <span className="font-regular text-text-muted"> (opcional)</span> : null}
    </label>
  )
}
