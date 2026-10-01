import { getSchema, type JSONContent } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

// ADM-005 · ADR 0009 · Extensões aprovadas do editor. O schema do ProseMirror gerado delas é a
// allowlist: HTML colado ou JSON com nó/marca fora da lista não entra no documento.

/** Links só com http(s), mailto ou caminho do próprio site (mesma regra do site, ADR 0025). */
export function isSafeLinkHref(value: string): boolean {
  const href = value.trim()
  if (/^\/(?![/\\])/.test(href) && !href.includes('\\')) return true
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(href).protocol)
  } catch {
    return false
  }
}

export const RICH_TEXT_EXTENSIONS = [
  Document,
  Paragraph,
  Text,
  HardBreak,
  Heading.configure({ levels: [2, 3] }),
  Bold,
  Italic,
  BulletList,
  OrderedList,
  ListItem,
  Blockquote,
  Link.configure({
    openOnClick: false,
    autolink: false,
    linkOnPaste: false,
    HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: null },
    isAllowedUri: (url) => isSafeLinkHref(url),
  }),
  Image.configure({ inline: false, allowBase64: false }),
]

const schema = getSchema(RICH_TEXT_EXTENSIONS)

export const RICH_TEXT_MESSAGES = {
  empty: 'Escreva o conteúdo do artigo.',
  invalid: 'O conteúdo não pôde ser lido. Recarregue a página e tente de novo.',
  imageAlt: 'Toda imagem precisa de texto alternativo.',
  imageSource: 'Envie as imagens pelo botão Imagem.',
  link: 'Use links que comecem com http://, https://, mailto: ou /.',
} as const

export type RichTextCheck = { ok: true; doc: JSONContent } | { ok: false; error: string }

type Attrs = Record<string, unknown>

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function firstProblem(doc: ProseMirrorNode, imagePrefix: string | null): string | null {
  let problem: string | null = null
  doc.descendants((node) => {
    if (problem) return false
    const attrs: Attrs = node.attrs
    if (node.type.name === 'image') {
      if (text(attrs.alt).trim() === '') problem = RICH_TEXT_MESSAGES.imageAlt
      else if (imagePrefix && !text(attrs.src).startsWith(imagePrefix))
        problem = RICH_TEXT_MESSAGES.imageSource
    }
    for (const mark of node.marks) {
      const markAttrs: Attrs = mark.attrs
      if (mark.type.name === 'link' && !isSafeLinkHref(text(markAttrs.href)))
        problem = RICH_TEXT_MESSAGES.link
    }
    return true
  })
  return problem
}

function isEmpty(doc: ProseMirrorNode): boolean {
  let hasContent = false
  doc.descendants((node) => {
    if (node.isText ? node.text?.trim() : node.type.name === 'image') hasContent = true
    return !hasContent
  })
  return !hasContent
}

/**
 * ADM-005 · Valida o documento Tiptap: só nós e marcas aprovados, com conteúdo, toda imagem com
 * `alt` (ADR 0031) e, no server, só imagens do bucket `article-images` deste artigo
 * (`imagePrefix`). Devolve o JSON normalizado pelo schema.
 */
export function checkRichText(json: unknown, imagePrefix: string | null): RichTextCheck {
  if (json === null) return { ok: false, error: RICH_TEXT_MESSAGES.empty }
  let doc: ProseMirrorNode
  try {
    doc = ProseMirrorNode.fromJSON(schema, json)
    doc.check()
  } catch {
    return { ok: false, error: RICH_TEXT_MESSAGES.invalid }
  }
  if (doc.type.name !== 'doc') return { ok: false, error: RICH_TEXT_MESSAGES.invalid }
  if (isEmpty(doc)) return { ok: false, error: RICH_TEXT_MESSAGES.empty }

  const problem = firstProblem(doc, imagePrefix)
  return problem ? { ok: false, error: problem } : { ok: true, doc: doc.toJSON() }
}

/** Lê o campo `body` do formulário (JSON serializado pelo editor). */
export function parseBodyField(value: FormDataEntryValue | null): unknown {
  if (typeof value !== 'string' || value === '') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

// ADM-008 · ADR 0007: a prévia pública são os 3 primeiros blocos de nível superior.
export const PREVIEW_BLOCKS = 3

export function richTextPreview(doc: JSONContent): JSONContent {
  return { type: 'doc', content: (doc.content ?? []).slice(0, PREVIEW_BLOCKS) }
}

/** `src` de todas as imagens do documento, na ordem em que aparecem. */
export function imageSources(doc: JSONContent): string[] {
  const own = doc.type === 'image' && typeof doc.attrs?.src === 'string' ? [doc.attrs.src] : []
  return [...own, ...(doc.content ?? []).flatMap(imageSources)]
}
