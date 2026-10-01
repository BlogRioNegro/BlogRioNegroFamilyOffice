import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '../cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-control border border-transparent font-medium text-sm whitespace-nowrap transition-colors duration-(--duration-fast) disabled:pointer-events-none disabled:border-transparent disabled:bg-disabled-bg disabled:text-disabled-text aria-busy:cursor-progress',
  {
    variants: {
      variant: {
        primary:
          'bg-action-primary text-action-primary-text hover:bg-action-primary-hover aria-busy:bg-action-primary-hover aria-busy:text-action-primary-text',
        secondary:
          'border-border-strong bg-surface text-text hover:border-text-muted hover:bg-surface-muted aria-busy:border-border-strong aria-busy:bg-surface-muted aria-busy:text-text',
        ghost: 'text-text hover:bg-surface-muted',
        link: 'text-text underline underline-offset-3 hover:decoration-2 disabled:bg-transparent',
      },
      size: {
        md: 'h-(--control-height) px-4',
        sm: 'h-(--control-height-sm) px-3 text-xs',
        icon: 'size-(--control-height) p-0',
        'icon-sm': 'size-(--control-height-sm) p-0 text-xs',
      },
      block: { true: 'w-full' },
    },
    // O link acompanha o texto: sem a altura e o padding do tamanho.
    compoundVariants: [{ variant: 'link', className: 'h-auto p-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Renderiza o filho (ex.: <a> ou <Link>) com o estilo do botão. */
    asChild?: boolean
    /** Mostra o spinner, marca aria-busy e bloqueia cliques repetidos. */
    loading?: boolean
  }

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, block }), className)

  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
      {children}
    </button>
  )
}
