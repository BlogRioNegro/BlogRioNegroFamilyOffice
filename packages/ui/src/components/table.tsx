import type { ComponentProps } from 'react'
import { cn } from '../cn'

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="w-full overflow-x-auto rounded-card border border-border bg-surface shadow-card">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  )
}

/** Legenda acessível da tabela (oculta visualmente). */
export function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return <caption className={cn('sr-only', className)} {...props} />
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('bg-bg', className)} {...props} />
}

export function TableBody(props: ComponentProps<'tbody'>) {
  return <tbody {...props} />
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn('border-b border-border last:border-0 hover:bg-surface-muted', className)}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      scope="col"
      className={cn('px-4 py-3 text-left text-xs font-semibold text-text-muted', className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 text-text', className)} {...props} />
}
