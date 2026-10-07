import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SiteHeader } from './site-header'

// PUB-016 · HTML do server (o que chega sem JavaScript): "Artigos" na home e, nas outras páginas,
// "Voltar" como link de verdade para o nível acima.

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn() }),
  usePathname: () => '/',
}))

function navLinks(html: string): string[] {
  const nav = html.match(/<nav[^>]*>(.*?)<\/nav>/)?.[1] ?? ''
  return nav.match(/<a [^>]*>[^<]*<\/a>/g) ?? []
}

describe('SiteHeader', () => {
  it('na home, o item do menu é "Artigos", para /artigos', () => {
    const [link, ...others] = navLinks(renderToStaticMarkup(<SiteHeader />))

    expect(others).toEqual([])
    expect(link).toMatch(/href="\/artigos"/)
    expect(link).toMatch(/>Artigos<\/a>$/)
    expect(link).not.toContain('aria-label')
  })

  it.each(['/', '/artigos'] as const)(
    'com back="%s", o item é "Voltar", com esse destino de reserva e nome acessível',
    (back) => {
      const [link, ...others] = navLinks(renderToStaticMarkup(<SiteHeader back={back} />))

      expect(others).toEqual([])
      expect(link).toContain(`href="${back}"`)
      expect(link).toContain('aria-label="Voltar para a página anterior"')
      expect(link).toMatch(/>Voltar<\/a>$/)
      expect(link).not.toContain('aria-current')
    },
  )

  it('"Voltar" usa o estilo de texto do item de menu, sem seta, fundo nem contorno', () => {
    const artigos = navLinks(renderToStaticMarkup(<SiteHeader />))[0] ?? ''
    const voltar = navLinks(renderToStaticMarkup(<SiteHeader back="/" />))[0] ?? ''
    const classes = (link: string) => (link.match(/class="([^"]*)"/)?.[1] ?? '').split(' ')

    for (const name of classes(artigos)) expect(classes(voltar)).toContain(name)
    expect(classes(voltar).filter((name) => /^(bg-|border|rounded)/.test(name))).toEqual([])
    expect(voltar).not.toContain('<svg')
  })
})
