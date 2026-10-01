import { useId, type ComponentProps } from 'react'
import { cn } from '../cn'
import { FieldMessage } from './field-message'
import { Input } from './input'
import { Label } from './label'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  /** Texto de ajuda; some quando há erro. */
  help?: string
  /** Mensagem de erro; ativa aria-invalid e aria-describedby. */
  error?: string
  optional?: boolean
}

export function TextField({
  label,
  help,
  error,
  optional,
  id,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-mensagem`
  const message = error ?? help

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={inputId} optional={optional}>
        {label}
      </Label>
      <Input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...props}
      />
      {message ? (
        <FieldMessage id={messageId} variant={error ? 'error' : 'help'}>
          {message}
        </FieldMessage>
      ) : null}
    </div>
  )
}
