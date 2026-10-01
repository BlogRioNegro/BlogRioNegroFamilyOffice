import { readFileSync } from 'node:fs'
import path from 'node:path'
import { inflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { renderArticlePdf } from './article-pdf'

// ADM-008 · O PDF gerado contém todo o texto e as imagens.
const COVERS = path.resolve(import.meta.dirname, '../../../../supabase/storage/covers')
const PNG = readFileSync(
  path.join(
    COVERS,
    '11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
  ),
)
const OTHER_PNG = readFileSync(
  path.join(
    COVERS,
    '22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000001.png',
  ),
)

/** Texto dos operadores TJ (hex em latin1), sem espaços: o kerning quebra as palavras. */
function pdfText(pdf: Buffer): string {
  const raw = pdf.toString('latin1')
  const streams: string[] = []
  for (const match of raw.matchAll(/stream\r?\n/g)) {
    const start = (match.index ?? 0) + match[0].length
    try {
      streams.push(
        inflateSync(pdf.subarray(start, raw.indexOf('endstream', start))).toString('latin1'),
      )
    } catch {
      // stream de imagem ou fonte, sem texto
    }
  }
  const hex = streams.join('\n').match(/<[0-9a-f]+>/g) ?? []
  return hex
    .map((chunk) => Buffer.from(chunk.slice(1, -1), 'hex').toString('latin1'))
    .join('')
    .replace(/\s/g, '')
}

function imageCount(pdf: Buffer): number {
  return pdf.toString('latin1').match(/\/Subtype \/Image/g)?.length ?? 0
}

const withoutSpaces = (value: string) => value.replace(/\s/g, '')

const SRC = 'https://cdn.test/article-images/artigo/grafico.png'
const MISSING = 'https://cdn.test/article-images/artigo/foto.png'

const DOC = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Cenário de juros' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'A Selic caiu e a ' },
        { type: 'text', text: 'renda fixa', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' segue atraente.' },
      ],
    },
    {
      type: 'orderedList',
      attrs: { start: 1 },
      content: ['Tesouro IPCA+', 'CDB pós-fixado'].map((item) => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
      })),
    },
    {
      type: 'blockquote',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Diversificar é proteção.' }] },
      ],
    },
    { type: 'image', attrs: { src: SRC, alt: 'Gráfico da Selic' } },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Conclusão' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Último parágrafo do artigo.' }] },
  ],
}

describe('renderArticlePdf', () => {
  it('contém o título, todo o texto, a capa e as imagens', async () => {
    const pdf = await renderArticlePdf({
      title: 'Renda fixa em 2026',
      cover: { data: PNG, format: 'png' },
      doc: DOC,
      images: new Map([[SRC, { data: OTHER_PNG, format: 'png' }]]),
    })

    const text = pdfText(pdf)
    for (const expected of [
      'Renda fixa em 2026',
      'Cenário de juros',
      'A Selic caiu e a renda fixa segue atraente.',
      'Tesouro IPCA+',
      'CDB pós-fixado',
      'Diversificar é proteção.',
      'Conclusão',
      'Último parágrafo do artigo.',
    ])
      expect(text).toContain(withoutSpaces(expected))
    expect(imageCount(pdf)).toBe(2)
  })

  it('imagem que não pôde ser embutida entra como texto alternativo', async () => {
    const pdf = await renderArticlePdf({
      title: 'Artigo',
      cover: null,
      doc: {
        type: 'doc',
        content: [{ type: 'image', attrs: { src: MISSING, alt: 'Foto da equipe' } }],
      },
      images: new Map(),
    })

    expect(pdfText(pdf)).toContain(withoutSpaces('[Imagem: Foto da equipe]'))
    expect(imageCount(pdf)).toBe(0)
  })
})
