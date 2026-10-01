import { cva, type VariantProps } from 'class-variance-authority'
import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '../cn'

const alertVariants = cva('flex gap-3 rounded-control border px-4 py-3 text-xs text-text', {
  variants: {
    variant: {
      success: 'border-success-border bg-success-bg',
      error: 'border-error-border bg-error-bg',
      warning: 'border-warning-border bg-warning-bg',
    },
  },
  defaultVariants: { variant: 'success' },
})

const ICONS = {
  success: { Icon: CircleCheck, color: 'text-success' },
  error: { Icon: CircleAlert, color: 'text-error' },
  warning: { Icon: TriangleAlert, color: 'text-warning' },
} as const

type AlertProps = ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & {
    title: string
  }

// error interrompe o leitor de tela (role="alert"); os demais são anunciados sem interromper.
export function Alert({ className, variant, title, children, ...props }: AlertProps) {
  const tone = variant ?? 'success'
  const { Icon, color } = ICONS[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant: tone }), className)}
      {...props}
    >
      <Icon aria-hidden className={cn('mt-0.5 size-5 shrink-0', color)} />
      <div className="flex flex-col">
        <p className={cn('text-sm font-semibold', color)}>{title}</p>
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  )
}
