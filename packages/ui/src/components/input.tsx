import type { ComponentProps } from 'react'
import { cn } from '../cn'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-(--control-height) w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-text transition-colors duration-(--duration-fast) placeholder:text-text-muted hover:border-text-muted disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text aria-invalid:border-error',
        className,
      )}
      {...props}
    />
  )
}
