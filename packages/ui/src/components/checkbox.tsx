'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../cn'
import { FieldMessage } from './field-message'

type CheckboxProps = Omit<ComponentProps<typeof CheckboxPrimitive.Root>, 'children'> & {
  /** Label longa (pode conter link); a linha inteira marca a caixa. */
  children: ReactNode
  error?: string
}

// Consentimento nunca vem pré-marcado: não há defaultChecked padrão.
export function Checkbox({ id, className, children, error, ...props }: CheckboxProps) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId
  const errorId = `${checkboxId}-erro`

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-start gap-3">
        <CheckboxPrimitive.Root
          id={checkboxId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="peer mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-control border border-border-strong bg-surface data-[state=checked]:border-action-primary data-[state=checked]:bg-action-primary data-[state=checked]:text-action-primary-text disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg disabled:data-[state=checked]:border-border-strong disabled:data-[state=checked]:bg-border-strong disabled:data-[state=checked]:text-surface aria-invalid:border-error"
          {...props}
        >
          <CheckboxPrimitive.Indicator>
            <Check aria-hidden className="size-4" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        <label htmlFor={checkboxId} className="text-sm text-text peer-disabled:text-disabled-text">
          {children}
        </label>
      </div>
      {error ? (
        <FieldMessage id={errorId} variant="error" className="pl-8">
          {error}
        </FieldMessage>
      ) : null}
    </div>
  )
}
