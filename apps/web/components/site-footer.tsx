import { Button } from '@rio-negro/ui'
import { ArrowRight, Instagram, Linkedin } from '@rio-negro/ui/icons'
import Link from 'next/link'
import { socialLinks, type SocialNetwork } from '@/lib/domain/social-links'
import { env } from '@/lib/env'
import { Logo } from './logo'

// PUB-013 · Cópia exata do rodapé de rionegromfo.com.br (2026-10-01). Não editar à mão.
const RIGHTS_NOTICE = '2024 RIO NEGRO FAMILY OFFICE • TODOS OS DIREITOS RESERVADOS'

const SOCIAL_ICONS: Record<SocialNetwork, typeof Linkedin> = {
  linkedin: Linkedin,
  instagram: Instagram,
}

export function SiteFooter() {
  const social = socialLinks({
    linkedin: env.NEXT_PUBLIC_LINKEDIN_URL,
    instagram: env.NEXT_PUBLIC_INSTAGRAM_URL,
  })

  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto flex max-w-(--layout-admin) flex-col gap-8 px-4 pt-12 pb-8 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <Logo alt="Rio Negro Family Office" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button asChild variant="link">
              <a href={env.NEXT_PUBLIC_RIO_NEGRO_URL} target="_blank" rel="noopener noreferrer">
                Conheça a Rio Negro Family Office
                <ArrowRight aria-hidden className="size-4" />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </Button>
            {social.length > 0 ? (
              <ul aria-label="Redes sociais" className="flex gap-3">
                {social.map(({ network, label, href }) => {
                  const Icon = SOCIAL_ICONS[network]
                  return (
                    <li key={network}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-(--control-height) items-center justify-center rounded-full bg-action-primary text-action-primary-text transition-colors duration-(--duration-fast) hover:bg-action-primary-hover"
                      >
                        <Icon aria-hidden className="size-5" />
                        <span className="sr-only">{label} (abre em nova aba)</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4 text-xs text-text-muted">
          <span>{RIGHTS_NOTICE}</span>
          <Link
            href="/privacidade"
            className="text-link underline underline-offset-3 hover:decoration-2"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
