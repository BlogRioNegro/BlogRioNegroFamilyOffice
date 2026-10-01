import { generateJSON } from '@tiptap/html/server'
import { describe, expect, it } from 'vitest'
import {
  checkRichText,
  isSafeLinkHref,
  parseBodyField,
  RICH_TEXT_EXTENSIONS,
  RICH_TEXT_MESSAGES,
  imageSources,
  richTextPreview,
} from './rich-text'

const PREFIX = 'http://127.0.0.1:54321/storage/v1/object/public/article-images/artigo-1/'

function doc(...content: unknown[]) {
  return { type: 'doc', content }
}

function paragraph(value: string) {
  return { type: 'paragraph', content: [{ type: 'text', text: value }] }
}

function image(attrs: Record<string, string | null>) {
  return { type: 'image', attrs }
}

describe('HTML colado no editor (ADM-005)', () => {
  it('mantém só nós e marcas permitidos', () => {
    const json = generateJSON(
      [
        '<h1>Título grande</h1>',
        '<h2>Seção</h2>',
        '<p onclick="alert(1)" style="color:red"><strong>forte</strong> <u>sublinhado</u> <s>riscado</s> <code>x</code></p>',
        '<table><tr><td>célula</td></tr></table>',
        '<script>alert(1)</script>',
        '<pre><code>código</code></pre>',
        '<hr>',
        '<a href="javascript:alert(1)">perigoso</a>',
      ].join(''),
      RICH_TEXT_EXTENSIONS,
    )

    const serialized = JSON.stringify(json)
    for (const forbidden of [
      'table',
      'codeBlock',
      'code',
      'underline',
      'strike',
      'horizontalRule',
      'onclick',
      'style',
      'javascript',
      'script',
    ])
      expect(serialized).not.toContain(`"${forbidden}`)
    expect(json.content.map((node: { type: string }) => node.type)).toEqual([
      'paragraph',
      'heading',
      'paragraph',
      'paragraph',
      'paragraph',
      'paragraph',
    ])
    expect(serialized).toContain('"bold"')
    expect(serialized).not.toContain('alert')
  })

  it('só aceita H2 e H3', () => {
    const json = generateJSON('<h2>a</h2><h3>b</h3><h4>c</h4>', RICH_TEXT_EXTENSIONS)

    expect(json.content).toMatchObject([
      { type: 'heading', attrs: { level: 2 } },
      { type: 'heading', attrs: { level: 3 } },
      { type: 'paragraph' },
    ])
  })
})

describe('checkRichText', () => {
  it('aceita o documento com os nós aprovados', () => {
    const body = doc(
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Seção' }] },
      paragraph('Texto'),
      { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph('item')] }] },
      { type: 'blockquote', content: [paragraph('citação')] },
      image({ src: `${PREFIX}foto.png`, alt: 'Gráfico da Selic' }),
    )

    expect(checkRichText(body, PREFIX)).toMatchObject({ ok: true, doc: { type: 'doc' } })
  })

  it('impede imagem sem alt (ADR 0031)', () => {
    expect(checkRichText(doc(image({ src: `${PREFIX}foto.png`, alt: '  ' })), PREFIX)).toEqual({
      ok: false,
      error: RICH_TEXT_MESSAGES.imageAlt,
    })
    expect(checkRichText(doc(image({ src: `${PREFIX}foto.png`, alt: null })), null)).toEqual({
      ok: false,
      error: RICH_TEXT_MESSAGES.imageAlt,
    })
  })

  it('no server, recusa imagem fora do bucket do artigo', () => {
    expect(
      checkRichText(doc(image({ src: 'https://exemplo.com/foto.png', alt: 'Foto' })), PREFIX),
    ).toEqual({ ok: false, error: RICH_TEXT_MESSAGES.imageSource })
  })

  it('recusa nó fora da allowlist', () => {
    expect(checkRichText(doc({ type: 'table', content: [] }), null)).toEqual({
      ok: false,
      error: RICH_TEXT_MESSAGES.invalid,
    })
  })

  it('recusa link com protocolo perigoso', () => {
    const body = doc({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'x',
          marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
        },
      ],
    })

    expect(checkRichText(body, null)).toEqual({ ok: false, error: RICH_TEXT_MESSAGES.link })
  })

  it('recusa documento vazio ou ausente', () => {
    expect(checkRichText(doc({ type: 'paragraph' }), null)).toEqual({
      ok: false,
      error: RICH_TEXT_MESSAGES.empty,
    })
    expect(checkRichText(null, null)).toEqual({ ok: false, error: RICH_TEXT_MESSAGES.empty })
  })
})

describe('isSafeLinkHref', () => {
  it.each(['https://rionegro.com.br', 'mailto:contato@rionegro.com.br', '/artigos/x'])(
    'aceita %s',
    (href) => {
      expect(isSafeLinkHref(href)).toBe(true)
    },
  )

  it.each(['javascript:alert(1)', '//evil.com', 'data:text/html,x', '/\\evil.com'])(
    'recusa %s',
    (href) => {
      expect(isSafeLinkHref(href)).toBe(false)
    },
  )
})

describe('parseBodyField', () => {
  it('lê o JSON do campo e devolve null para vazio ou inválido', () => {
    expect(parseBodyField('{"type":"doc"}')).toEqual({ type: 'doc' })
    expect(parseBodyField('')).toBeNull()
    expect(parseBodyField('{')).toBeNull()
  })
})

describe('richTextPreview', () => {
  const blocks = ['um', 'dois', 'três', 'quatro', 'cinco'].map(paragraph)

  it('mantém só os 3 primeiros blocos de nível superior', () => {
    expect(richTextPreview({ type: 'doc', content: blocks })).toEqual({
      type: 'doc',
      content: blocks.slice(0, 3),
    })
  })

  it('conta uma lista inteira como um bloco', () => {
    const list = {
      type: 'bulletList',
      content: ['a', 'b', 'c', 'd'].map((item) => ({
        type: 'listItem',
        content: [paragraph(item)],
      })),
    }
    const preview = richTextPreview({ type: 'doc', content: [list, ...blocks] })

    expect(preview.content).toEqual([list, blocks[0], blocks[1]])
  })

  it('documento com menos de 3 blocos fica inteiro', () => {
    const single = paragraph('único')

    expect(richTextPreview({ type: 'doc', content: [single] })).toEqual({
      type: 'doc',
      content: [single],
    })
    expect(richTextPreview({ type: 'doc' })).toEqual({ type: 'doc', content: [] })
  })
})

describe('imageSources', () => {
  it('encontra imagens em qualquer nível, na ordem', () => {
    const doc = {
      type: 'doc',
      content: [
        image({ src: 'https://x/a.png', alt: 'A' }),
        { type: 'blockquote', content: [image({ src: 'https://x/b.png', alt: 'B' })] },
      ],
    }

    expect(imageSources(doc)).toEqual(['https://x/a.png', 'https://x/b.png'])
  })
})
