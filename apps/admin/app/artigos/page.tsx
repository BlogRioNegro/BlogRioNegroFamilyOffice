import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TypeBadge,
} from '@rio-negro/ui'
import { Eye, Pencil, Plus, Trash2 } from '@rio-negro/ui/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { deleteArticle } from '@/app/artigos/actions'
import { AdminHeader } from '@/components/admin-header'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { formatDate } from '@/lib/domain/admin-date'
import { listArticlesWithLeadCount, type ArticleRow } from '@/lib/services/articles'
import { requireAdminPage } from '@/lib/services/require-admin'

export const metadata: Metadata = {
  title: 'Artigos · Rio Negro Admin',
}

// Selo informativo do artigo em destaque no site (ADR 0004): badge de texto com ponto.
function FeaturedBadge() {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-control border border-border bg-surface px-2 text-xs leading-none font-medium whitespace-nowrap text-text">
      <span aria-hidden className="size-1.5 rounded-full bg-text" />
      Em destaque
    </span>
  )
}

function editHref(article: ArticleRow) {
  return `/artigos/${article.id}`
}

function leadsHref(article: ArticleRow) {
  return `/artigos/${article.id}/leads`
}

// ADM-012 · Confirmação da exclusão; os leads do artigo permanecem (ADR 0013).
function DeleteArticle({ article, trigger }: { article: ArticleRow; trigger: ReactNode }) {
  return (
    <ConfirmDeleteDialog
      trigger={trigger}
      title="Excluir artigo?"
      message={`“${article.title}” será removido do site. Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir artigo"
      action={deleteArticle.bind(null, article.id)}
    />
  )
}

function ArticlesTable({ articles }: { articles: ArticleRow[] }) {
  return (
    <Table>
      <TableCaption>Artigos publicados</TableCaption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Título</TableHead>
          <TableHead className="w-24">Tipo</TableHead>
          <TableHead className="w-30">Publicação</TableHead>
          <TableHead className="w-20 text-right">Leads</TableHead>
          <TableHead className="w-80 text-right">
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article, index) => (
          <TableRow key={article.id}>
            <TableCell>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{article.title}</span>
                {index === 0 ? <FeaturedBadge /> : null}
              </div>
            </TableCell>
            <TableCell>
              <TypeBadge type={article.content_type} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-text-muted">
              {formatDate(article.published_at)}
            </TableCell>
            <TableCell className="text-right">{article.leadCount}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="sm">
                  <Link href={editHref(article)}>
                    <Pencil aria-hidden className="size-4" />
                    Editar
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={leadsHref(article)}>
                    <Eye aria-hidden className="size-4" />
                    Ver leads
                  </Link>
                </Button>
                <DeleteArticle
                  article={article}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Trash2 aria-hidden className="size-4" />
                      Excluir
                    </Button>
                  }
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ArticleCards({ articles }: { articles: ArticleRow[] }) {
  return (
    <ul aria-label="Artigos publicados" className="flex flex-col gap-3">
      {articles.map((article, index) => (
        <li
          key={article.id}
          className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card"
        >
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={article.content_type} />
            {index === 0 ? <FeaturedBadge /> : null}
          </div>
          <span className="text-md leading-snug font-semibold text-pretty">{article.title}</span>
          <div className="flex items-end justify-between gap-3">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
              <dt className="text-text-muted">Publicação</dt>
              <dd>{formatDate(article.published_at)}</dd>
              <dt className="text-text-muted">Leads</dt>
              <dd>{article.leadCount}</dd>
            </dl>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Ações</Button>
              </DialogTrigger>
              <DialogContent title="Ações do artigo">
                <div className="flex flex-col gap-3">
                  <p className="mb-2 text-sm text-text-muted">{article.title}</p>
                  <Button asChild variant="secondary" block>
                    <Link href={editHref(article)}>
                      <Pencil aria-hidden className="size-4" />
                      Editar
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" block>
                    <Link href={leadsHref(article)}>
                      <Eye aria-hidden className="size-4" />
                      Ver leads
                    </Link>
                  </Button>
                  <DeleteArticle
                    article={article}
                    trigger={
                      <Button variant="secondary" block>
                        <Trash2 aria-hidden className="size-4" />
                        Excluir
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

// ADM-003 · Ordem do site (published_at desc); o primeiro é o destaque, só como informação.
export default async function ArticlesPage() {
  const { supabase } = await requireAdminPage()
  const articles = await listArticlesWithLeadCount(supabase)
  const count = `${articles.length} ${articles.length === 1 ? 'publicado' : 'publicados'}`

  return (
    <>
      <AdminHeader current="artigos" />
      <main className="mx-auto flex w-full max-w-(--layout-admin) flex-col gap-4 px-4 pt-6 pb-12 md:gap-6 md:px-6 md:pt-8 md:pb-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Artigos</h1>
            <p className="text-xs text-text-muted">
              {count} · o mais recente aparece em destaque no site
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="max-md:h-(--control-height) max-md:w-full max-md:text-sm"
          >
            <Link href="/artigos/novo">
              <Plus aria-hidden className="size-4" />
              Novo artigo
            </Link>
          </Button>
        </div>
        <div className="hidden md:block">
          <ArticlesTable articles={articles} />
        </div>
        <div className="md:hidden">
          <ArticleCards articles={articles} />
        </div>
      </main>
    </>
  )
}
