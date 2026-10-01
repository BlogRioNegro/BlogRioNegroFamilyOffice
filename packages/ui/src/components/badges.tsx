import { AlignLeft, FileText } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../cn'

const badgeBase =
  'inline-flex h-6 items-center gap-1 rounded-control border border-transparent px-2 text-xs leading-none font-medium whitespace-nowrap'

const STATUS = {
  disabled: {
    label: 'Desativado',
    classes: 'bg-surface-muted text-text-muted',
    dot: 'bg-text-muted',
  },
  pending: {
    label: 'Pendente',
    classes: 'border-warning-border bg-warning-bg text-warning',
    dot: 'bg-warning',
  },
  sent: {
    label: 'Enviado',
    classes: 'border-success-border bg-success-bg text-success',
    dot: 'bg-success',
  },
  failed: {
    label: 'Falhou',
    classes: 'border-error-border bg-error-bg text-error',
    dot: 'bg-error',
  },
} as const

export type WebhookStatus = keyof typeof STATUS

/** Status do envio do lead ao CRM (admin): cor + ponto + texto. */
export function StatusBadge({ status, children }: { status: WebhookStatus; children?: ReactNode }) {
  const { label, classes, dot } = STATUS[status]
  return (
    <span className={cn(badgeBase, classes)}>
      <span aria-hidden className={cn('size-1.5 rounded-full', dot)} />
      {children ?? label}
    </span>
  )
}

const TYPE = {
  pdf: { label: 'PDF', Icon: FileText, classes: 'bg-surface-muted text-text' },
  rich_text: { label: 'Texto', Icon: AlignLeft, classes: 'border-border bg-surface text-text' },
} as const

export type ArticleContentType = keyof typeof TYPE

/** Formato do artigo, nos cards e na tabela do admin. */
export function TypeBadge({ type }: { type: ArticleContentType }) {
  const { label, Icon, classes } = TYPE[type]
  return (
    <span className={cn(badgeBase, classes)}>
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  )
}
