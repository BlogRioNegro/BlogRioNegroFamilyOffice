'use client'

import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTrigger,
  TextField,
} from '@rio-negro/ui'
import { Download, ExternalLink } from '@rio-negro/ui/icons'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { requestArticleDownload } from '@/app/artigos/[slug]/actions'
import { LEAD_ERROR_MESSAGE, leadSchema, SIGNED_URL_SECONDS } from '@/lib/domain/lead'
import { maskPhone } from '@/lib/domain/phone-mask'
import { Turnstile } from './turnstile'

// LEAD-001 · Modal de lead (spec 04, UI). O estado vive só enquanto o modal está aberto: fechar
// desmonta o formulário e descarta os dados (LEAD-011). Nada vai para storage, URL ou console.

type Field = 'name' | 'email' | 'phone' | 'consent'
const FIELD_ORDER: Field[] = ['name', 'email', 'phone', 'consent']

type Values = {
  name: string
  email: string
  phone: string
  consent: boolean
  marketingOptIn: boolean
}
const EMPTY: Values = { name: '', email: '', phone: '', consent: false, marketingOptIn: false }

export type LeadArticle = { id: string; title: string; format: 'PDF' | 'Texto' }

type Props = { article: LeadArticle; turnstileSiteKey: string; rioNegroUrl: string }

// Margem para o clique não chegar ao Storage com a URL já vencida.
const URL_REUSE_MS = (SIGNED_URL_SECONDS - 5) * 1000

type SignedDownload = { url: string; expiresAt: number }

function isField(key: PropertyKey | undefined): key is Field {
  return FIELD_ORDER.some((field) => field === key)
}

function startDownload(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
}

/** LEAD-010 · Sucesso: o download já começou; o CTA "Conheça a Rio Negro" só aparece aqui. */
function SuccessView({
  articleTitle,
  rioNegroUrl,
  onDownloadAgain,
}: {
  articleTitle: string
  rioNegroUrl: string
  onDownloadAgain: () => void
}) {
  const again = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    again.current?.focus()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="success" title="O download começou.">
        “{articleTitle}” está sendo salvo no seu dispositivo.
      </Alert>
      <div>
        <Button ref={again} variant="link" onClick={onDownloadAgain}>
          <Download aria-hidden className="size-5" />
          Baixar novamente
        </Button>
      </div>
      <div className="mt-2 flex flex-col gap-3 border-t border-border pt-6">
        <Button asChild block>
          <a href={rioNegroUrl} target="_blank" rel="noopener noreferrer">
            Conheça a Rio Negro
            <ExternalLink aria-hidden className="size-5" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        </Button>
      </div>
    </div>
  )
}

function LeadForm({ article, turnstileSiteKey, rioNegroUrl }: Props) {
  const id = useId()
  const fieldId = (field: keyof Values) => `${id}-${field}`
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [token, setToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)
  const [download, setDownload] = useState<SignedDownload | null>(null)
  const [expired, setExpired] = useState(false)

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    if (isField(key)) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function failSubmit(message: string) {
    setFormError(message)
    setTurnstileReset((count) => count + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const input = { articleId: article.id, ...values, turnstileToken: token }
    const parsed = leadSchema.safeParse(input)
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (isField(key)) next[key] ??= issue.message
      }
      setErrors(next)
      const first = FIELD_ORDER.find((field) => next[field])
      if (first) document.getElementById(fieldId(first))?.focus()
      else failSubmit(LEAD_ERROR_MESSAGE)
      return
    }

    setErrors({})
    setFormError(null)
    setSubmitting(true)
    const result = await requestArticleDownload(input).catch(() => null)
    setSubmitting(false)

    if (!result?.ok) return failSubmit(result?.error ?? LEAD_ERROR_MESSAGE)
    // Com o lead gravado, os dados do formulário não ficam mais em memória.
    setValues(EMPTY)
    setExpired(false)
    setDownload({ url: result.data.url, expiresAt: Date.now() + URL_REUSE_MS })
    startDownload(result.data.url)
  }

  function downloadAgain() {
    if (download && Date.now() < download.expiresAt) return startDownload(download.url)
    setDownload(null)
    setExpired(true)
  }

  if (download) {
    return (
      <DialogContent title="Pronto!">
        <SuccessView
          articleTitle={article.title}
          rioNegroUrl={rioNegroUrl}
          onDownloadAgain={downloadAgain}
        />
      </DialogContent>
    )
  }

  return (
    <DialogContent
      title="Baixe o artigo completo"
      description={`${article.title} · ${article.format}`}
      onOpenAutoFocus={(event) => {
        event.preventDefault()
        document.getElementById(fieldId('name'))?.focus()
      }}
    >
      <form noValidate onSubmit={submit} className="flex flex-1 flex-col gap-4">
        {expired ? (
          <Alert variant="warning" title="O link de download expirou.">
            Envie o formulário de novo para baixar o artigo.
          </Alert>
        ) : null}
        <TextField
          id={fieldId('name')}
          label="Nome"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          disabled={submitting}
          onChange={(event) => update('name', event.target.value)}
        />
        <TextField
          id={fieldId('email')}
          label="E-mail"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          disabled={submitting}
          onChange={(event) => update('email', event.target.value)}
        />
        <TextField
          id={fieldId('phone')}
          label="Telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(99) 99999-9999"
          help="Com DDD. Ex.: (11) 91234-5678"
          value={values.phone}
          error={errors.phone}
          disabled={submitting}
          onChange={(event) => update('phone', maskPhone(event.target.value))}
        />
        {/* LEAD-003 · LEAD-013: textos do rascunho, versão POLICY_VERSION. Não reescrever. */}
        <p className="mt-2 text-xs text-text-muted">
          Usaremos seu nome, e-mail e telefone para enviar este material e registrar seu interesse.
          Se você autorizar abaixo, também poderemos enviar novidades da Rio Negro.
        </p>
        <Checkbox
          id={fieldId('consent')}
          checked={values.consent}
          error={errors.consent}
          disabled={submitting}
          onCheckedChange={(checked) => update('consent', checked === true)}
        >
          Li e concordo com o{' '}
          <a
            href="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-3 hover:decoration-2"
          >
            aviso de privacidade
          </a>
          .
        </Checkbox>
        {/* LEAD-004 · Opcional e desmarcado; o download não depende dele. */}
        <Checkbox
          id={fieldId('marketingOptIn')}
          checked={values.marketingOptIn}
          disabled={submitting}
          onCheckedChange={(checked) => update('marketingOptIn', checked === true)}
        >
          Aceito receber novidades da Rio Negro por e-mail, telefone ou WhatsApp.
        </Checkbox>
        <Turnstile siteKey={turnstileSiteKey} resetKey={turnstileReset} onToken={setToken} />
        {formError ? <Alert variant="error" title={formError} /> : null}
        {/* Mobile: o botão fica fixo no rodapé enquanto o corpo rola (spec 04, Layout). */}
        <div className="sticky -bottom-4 -mx-4 -mb-4 mt-auto border-t border-border bg-surface p-4 md:static md:m-0 md:border-0 md:p-0">
          <Button type="submit" block loading={submitting}>
            {submitting ? 'Enviando…' : 'Baixar artigo completo'}
            {submitting ? null : <Download aria-hidden className="size-5" />}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

/** Botão "Baixar artigo completo" da página do artigo e o modal que ele abre. */
export function LeadDialog(props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          Baixar artigo completo
          <Download aria-hidden className="size-5" />
        </Button>
      </DialogTrigger>
      {open ? <LeadForm {...props} /> : null}
    </Dialog>
  )
}
