import { Button } from '@rio-negro/ui'
import { ArrowRight } from '@rio-negro/ui/icons'
import Link from 'next/link'
import { env } from '@/lib/env'
import { Logo } from './logo'

// PUB-013 · Cópia exata do rodapé de rionegroinvestimentos.com.br (2026-09-25). Não editar à mão.
const DISCLAIMER =
  'A Rio Negro Assessoria de Investimentos Ltda, inscrita sob o CNPJ 33.457.321/0001-79 é uma empresa de Assessoria de Investimento devidamente registrada na Comissão de Valores Mobiliários na forma da Resolução CVM 178/23 (“Sociedade”), que mantém contrato de distribuição de produtos financeiros com a XP Investimentos Corretora de Câmbio, Títulos e Valores Mobiliários S.A. (“XP”) e pode, por conta e ordem dos seus clientes, operar no mercado de capitais segundo a legislação vigente. Na forma da legislação da CVM, o Assessor de Investimento não pode administrar ou gerir o patrimônio de investidores. O investimento em ações é um investimento de risco e rentabilidade passada não é garantia de rentabilidade futura. Na realização de operações com derivativos existe a possibilidade de perdas superiores aos valores investidos, podendo resultar em significativas perdas patrimoniais. A Sociedade poderá exercer atividades complementares relacionadas aos mercados financeiro, securitário, de previdência e capitalização, desde que não conflitem com a atividade de assessoria de investimentos, podendo ser realizada por meio da pessoa jurídica acima descrita ou por meio de pessoa jurídica terceira. Todas as atividades são prestadas mantendo a devida segregação e em cumprimento ao quanto previsto nas regras da CVM ou de outros órgãos reguladores e autorreguladores. Para informações e dúvidas sobre produtos contacte seu assessor de investimentos. Para reclamações, contacte a Ouvidoria da XP pelo telefone 0800 722 3730.'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto flex max-w-(--layout-admin) flex-col gap-8 px-4 pt-12 pb-8 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo alt="Rio Negro Investimentos" />
          <Button asChild variant="link">
            <a href={env.NEXT_PUBLIC_RIO_NEGRO_URL} target="_blank" rel="noopener noreferrer">
              Conheça a Rio Negro
              <ArrowRight aria-hidden className="size-4" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </Button>
        </div>
        <p className="mb-3 text-xs leading-[1.6] text-text-muted">{DISCLAIMER}</p>
        <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4 text-xs text-text-muted">
          <span>© {new Date().getFullYear()} Rio Negro Assessoria de Investimentos</span>
          <Link
            href="/privacidade"
            className="text-text underline underline-offset-3 hover:decoration-2"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
