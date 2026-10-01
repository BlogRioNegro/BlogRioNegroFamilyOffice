import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { parseRichText } from '@/lib/domain/rich-text'
import { RichText } from './rich-text'

// SEC-007 · JSON com <script>, javascript: e atributos on* não gera nada executável.

function render(json: unknown): string {
  return renderToStaticMarkup(<RichText blocks={parseRichText(json)} />)
}

const doc = (...content: unknown[]) => ({ type: 'doc', content })
const paragraph = (...content: unknown[]) => ({ type: 'paragraph', content })

// Procura só dentro das tags: texto escapado (&lt;script&gt;) é inerte.
const EXECUTABLE_IN_TAG = [
  /^<\/?(script|iframe|svg|object|embed|style)\b/i,
  /\son[a-z]+=/i,
  /javascript:/i,
  /data:/i,
  /\sstyle=/i,
]

function expectNothingExecutable(html: string) {
  const tags = html.match(/<[^>]*>/g) ?? []
  const offenders = tags.filter((tag) => EXECUTABLE_IN_TAG.some((pattern) => pattern.test(tag)))
  expect(offenders).toEqual([])
}

describe('RichText · XSS', () => {
  it('escapa HTML dentro do texto', () => {
    const html = render(
      doc(
        paragraph({ type: 'text', text: '<script>alert(1)</script><img src=x onerror=alert(1)>' }),
      ),
    )

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expectNothingExecutable(html)
  })

  it('ignora atributos on* e style injetados nos nós', () => {
    const html = render(
      doc({
        type: 'paragraph',
        attrs: { onclick: 'alert(1)', style: 'background:url(javascript:alert(1))' },
        content: [{ type: 'text', text: 'oi', attrs: { onmouseover: 'alert(1)' } }],
      }),
    )

    expect(html).toContain('>oi</p>')
    expectNothingExecutable(html)
  })

  it('não gera href javascript: nem data:', () => {
    const html = render(
      doc(
        paragraph(
          {
            type: 'text',
            text: 'a',
            marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
          },
          {
            type: 'text',
            text: 'b',
            marks: [{ type: 'link', attrs: { href: 'data:text/html;base64,PHNjcmlwdD4=' } }],
          },
        ),
      ),
    )

    expect(html).not.toContain('<a')
    expectNothingExecutable(html)
  })

  it('não gera img com src javascript: nem atributos extras', () => {
    const html = render(
      doc(
        { type: 'image', attrs: { src: 'javascript:alert(1)' } },
        {
          type: 'image',
          attrs: { src: 'https://cdn.example/a.png', alt: 'x', onerror: 'alert(1)' },
        },
      ),
    )

    expect(html.match(/<img/g)).toHaveLength(1)
    expect(html).toContain('src="https://cdn.example/a.png"')
    expectNothingExecutable(html)
  })

  it('escapa aspas no alt e no href', () => {
    const html = render(
      doc(
        { type: 'image', attrs: { src: 'https://cdn.example/a.png', alt: '" onerror="alert(1)' } },
        paragraph({
          type: 'text',
          text: 'x',
          marks: [{ type: 'link', attrs: { href: 'https://example.com/"onmouseover="alert(1)' } }],
        }),
      ),
    )

    expect(html).toContain('alt="&quot; onerror=&quot;alert(1)"')
    expect(html).toContain('href="https://example.com/%22onmouseover=%22alert(1)"')
    expect(html).not.toMatch(/"\s+on[a-z]+="/i)
  })

  it('links externos recebem rel="noopener noreferrer nofollow"', () => {
    const html = render(
      doc(
        paragraph(
          {
            type: 'text',
            text: 'XP',
            marks: [{ type: 'link', attrs: { href: 'https://xp.com.br' } }],
          },
          { type: 'text', text: 'outro', marks: [{ type: 'link', attrs: { href: '/artigos' } }] },
        ),
      ),
    )

    expect(html).toContain('<a href="https://xp.com.br/" rel="noopener noreferrer nofollow"')
    expect(html).toMatch(/<a href="\/artigos" class=/)
  })
})

describe('RichText · estrutura', () => {
  it('renderiza títulos, listas, citações e marcas', () => {
    const html = render(
      doc(
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Título' }] },
        {
          type: 'orderedList',
          attrs: { start: 2 },
          content: [{ type: 'listItem', content: [paragraph({ type: 'text', text: 'passo' })] }],
        },
        {
          type: 'blockquote',
          content: [paragraph({ type: 'text', text: 'citação', marks: [{ type: 'italic' }] })],
        },
      ),
    )

    expect(html).toMatch(/<h2 [^>]*>Título<\/h2>/)
    expect(html).toMatch(/<ol start="2" [^>]*><li [^>]*><p [^>]*>passo<\/p><\/li><\/ol>/)
    expect(html).toMatch(/<blockquote [^>]*><p [^>]*><em>citação<\/em><\/p><\/blockquote>/)
  })
})
