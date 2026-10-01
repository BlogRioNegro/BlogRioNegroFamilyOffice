import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  StatusBadge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@rio-negro/ui'
import { ArrowLeft, Download, Trash2 } from '@rio-negro/ui/icons'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { deleteLead, resendWebhookFailures } from '@/app/leads/actions'
import { formatDate, formatDateTime, formatTime } from '@/lib/domain/admin-date'
import { formatPhone, type LeadRow } from '@/lib/domain/leads'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import { Pagination } from './pagination'
import { ResendFailuresButton } from './resend-failures-button'

const EMPTY_MESSAGE = 'Nenhum lead recebido ainda.'

type LeadsViewProps = {
  leads: LeadRow[]
  total: number
  page: number
  /** Complemento do subtítulo: título do artigo ou "todos os artigos". */
  scope: string
  /** Lista por artigo: mostra o link de volta para Artigos. */
  backToArticles?: boolean
  exportHref: string
  pageHref: (page: number) => string
  /** Filtro do reenvio: o artigo da lista, ou null na lista geral. */
  articleId: string | null
  /** Leads `failed` do filtro, ou null sem LEAD_WEBHOOK_URL (o botão some, ADM-014). */
  failedCount: number | null
}

function optIn(lead: LeadRow) {
  return lead.marketing_opt_in ? 'Sim' : 'Não'
}

// ADM-013 · Exclusão com confirmação (pedido do titular).
function DeleteLead({ lead, trigger }: { lead: LeadRow; trigger: ReactNode }) {
  return (
    <ConfirmDeleteDialog
      trigger={trigger}
      title="Excluir lead?"
      message={`Os dados de ${lead.name} (${lead.email}) serão apagados. Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir lead"
      action={deleteLead.bind(null, lead.id)}
    />
  )
}

function LeadsTable({ leads }: { leads: LeadRow[] }) {
  return (
    <Table>
      <TableCaption>Leads</TableCaption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Data</TableHead>
          <TableHead>Artigo</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Comunicações</TableHead>
          <TableHead>Envio</TableHead>
          <TableHead className="w-14">
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={8} className="py-12 text-center text-text-muted">
              {EMPTY_MESSAGE}
            </TableCell>
          </TableRow>
        ) : null}
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="whitespace-nowrap text-text-muted">
              <span className="flex flex-col">
                {formatDate(lead.created_at)}
                <span>{formatTime(lead.created_at)}</span>
              </span>
            </TableCell>
            <TableCell>
              <span className="block max-w-45">{lead.article_title_snapshot}</span>
            </TableCell>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell className="whitespace-nowrap text-text-muted">
              {formatPhone(lead.phone)}
            </TableCell>
            <TableCell>{optIn(lead)}</TableCell>
            <TableCell>
              <StatusBadge status={lead.webhook_status} />
            </TableCell>
            <TableCell className="text-right">
              <DeleteLead
                lead={lead}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label="Excluir lead">
                    <Trash2 aria-hidden className="size-4" />
                  </Button>
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function LeadCards({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) {
    return (
      <p className="rounded-card border border-border bg-surface p-6 text-center text-sm text-text-muted shadow-card">
        {EMPTY_MESSAGE}
      </p>
    )
  }
  return (
    <ul aria-label="Leads" className="flex flex-col gap-3">
      {leads.map((lead) => (
        <li
          key={lead.id}
          className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{lead.name}</span>
            <StatusBadge status={lead.webhook_status} />
          </div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
            <dt className="text-text-muted">Data</dt>
            <dd>{formatDateTime(lead.created_at)}</dd>
            <dt className="text-text-muted">Artigo</dt>
            <dd>{lead.article_title_snapshot}</dd>
            <dt className="text-text-muted">E-mail</dt>
            <dd className="break-words">{lead.email}</dd>
            <dt className="text-text-muted">Telefone</dt>
            <dd>{formatPhone(lead.phone)}</dd>
            <dt className="text-text-muted">Comunicações</dt>
            <dd>{optIn(lead)}</dd>
          </dl>
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Ações</Button>
              </DialogTrigger>
              <DialogContent title="Ações do lead">
                <div className="flex flex-col gap-3">
                  <p className="mb-2 text-sm text-text-muted">
                    {lead.name} · {lead.email}
                  </p>
                  <DeleteLead
                    lead={lead}
                    trigger={
                      <Button variant="secondary" block>
                        <Trash2 aria-hidden className="size-4" />
                        Excluir lead
                      </Button>
                    }
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** ADM-013 · Lista de leads (por artigo ou geral), exportação e exclusão. */
export function LeadsView({
  leads,
  total,
  page,
  scope,
  backToArticles = false,
  exportHref,
  pageHref,
  articleId,
  failedCount,
}: LeadsViewProps) {
  const empty = total === 0
  const actionClasses = 'max-md:h-(--control-height) max-md:w-full max-md:text-sm'

  return (
    <main className="mx-auto flex w-full max-w-(--layout-admin) flex-col gap-4 px-4 pt-6 pb-12 md:gap-6 md:px-6 md:pt-8 md:pb-16">
      {backToArticles ? (
        <div>
          <Button asChild variant="link">
            <Link href="/artigos">
              <ArrowLeft aria-hidden className="size-4" />
              Artigos
            </Link>
          </Button>
        </div>
      ) : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-xs text-text-muted">
            {total} {total === 1 ? 'lead' : 'leads'} · {scope}
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:justify-end">
          {empty ? (
            <Button variant="secondary" size="sm" disabled className={actionClasses}>
              <Download aria-hidden className="size-4" />
              Exportar CSV
            </Button>
          ) : (
            <Button asChild variant="secondary" size="sm" className={actionClasses}>
              <a href={exportHref} download>
                <Download aria-hidden className="size-4" />
                Exportar CSV
              </a>
            </Button>
          )}
          {failedCount === null ? null : (
            <ResendFailuresButton
              failedCount={failedCount}
              action={resendWebhookFailures.bind(null, articleId)}
              className={actionClasses}
            />
          )}
        </div>
      </div>
      <div className="hidden md:block">
        <LeadsTable leads={leads} />
      </div>
      <div className="md:hidden">
        <LeadCards leads={leads} />
      </div>
      {empty ? null : <Pagination page={page} total={total} href={pageHref} />}
    </main>
  )
}
