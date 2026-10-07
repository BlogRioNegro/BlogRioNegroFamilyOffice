import { cn } from '@rio-negro/ui'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Aviso de privacidade',
  description: 'Como o Blog Rio Negro Family Office trata os dados de quem baixa artigos.',
}

const FULL_POLICY_URL = 'https://rionegromfo.com.br/politica-de-privacidade/'

// PUB-014 · Texto de LEAD-013, versão "blog-2026-10-v1" (rascunho; o texto validado pelo cliente entra
// com nova versão). Mudar o texto exige mudar a versão. Só entra dado do controlador que consta em
// rionegromfo.com.br/politica-de-privacidade/ (lido em 2026-10-01); o resto fica "pendente".
const SECTIONS: { title: string; body: ReactNode }[] = [
  {
    title: 'Controlador',
    body: 'Rio Negro Family Office. [razão social, CNPJ e endereço — pendente]',
  },
  {
    title: 'Dados coletados',
    body: 'Nome, e-mail, telefone, data/hora do aceite e identificador técnico anonimizado do dispositivo de rede (hash do IP) para segurança.',
  },
  {
    title: 'Finalidades',
    body: 'Entregar o material solicitado, contato comercial sobre investimentos e, com autorização, envio de novidades; prevenção de abuso.',
  },
  { title: 'Base legal', body: 'Consentimento (LGPD, art. 7º, I).' },
  {
    title: 'Compartilhamento',
    body: 'Operadores de infraestrutura (hospedagem e banco de dados) e o CRM da Rio Negro Family Office.',
  },
  {
    title: 'Retenção',
    body: 'Até o titular solicitar a exclusão ou revogar o consentimento.',
  },
  {
    title: 'Direitos do titular',
    body: 'Direitos do titular (art. 18) e canal: [contato do encarregado — pendente].',
  },
  {
    title: 'Política completa',
    body: (
      <a
        href={FULL_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="break-words text-link underline underline-offset-3 hover:decoration-2"
      >
        {FULL_POLICY_URL}
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-(--layout-reading) flex-1 flex-col px-4 pt-8 pb-16 md:px-0 md:pt-16 md:pb-24">
        <h1 className="font-serif font-black text-h1 wrap-anywhere">Aviso de privacidade</h1>
        <p className="mt-3 mb-6 text-xs text-text-muted md:mb-8">
          Atualizado em <time dateTime="2026-10-01">1 out. 2026</time>
        </p>
        <div className="max-w-(--measure-article) text-md md:text-lg">
          {SECTIONS.map(({ title, body }, index) => (
            <section key={title}>
              <h2
                className={cn(
                  'mb-[0.6em] font-serif font-black text-xl wrap-anywhere',
                  index === 0 ? 'mt-0' : 'mt-[2em]',
                )}
              >
                {title}
              </h2>
              <p className="mb-[1.2em] text-pretty">{body}</p>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
