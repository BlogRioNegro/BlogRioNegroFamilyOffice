// SEC-007 · ADM-005 · Allowlist do JSON do Tiptap. Converte JSON não confiável numa árvore
// tipada só com os nós e marcas permitidos; o que não está na lista é descartado. URLs só
// entram com protocolo seguro. A árvore é renderizada por um componente, sem HTML cru (ADR 0025).

export type RichTextMark =
  { type: 'bold' } | { type: 'italic' } | { type: 'link'; href: string; external: boolean }

export type RichTextInline =
  { type: 'text'; text: string; marks: RichTextMark[] } | { type: 'hardBreak' }

export type RichTextBlock =
  | { type: 'paragraph'; content: RichTextInline[] }
  | { type: 'heading'; level: 2 | 3; content: RichTextInline[] }
  | { type: 'bulletList'; items: RichTextBlock[][] }
  | { type: 'orderedList'; start: number; items: RichTextBlock[][] }
  | { type: 'blockquote'; content: RichTextBlock[] }
  | { type: 'image'; src: string; alt: string }

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function children(node: JsonObject): JsonObject[] {
  return Array.isArray(node.content) ? node.content.filter(isObject) : []
}

function attrs(node: JsonObject): JsonObject {
  return isObject(node.attrs) ? node.attrs : {}
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/** Link absoluto http(s)/mailto ou caminho relativo do próprio site; o resto é recusado. */
function safeHref(value: unknown): { href: string; external: boolean } | null {
  const href = text(value).trim()
  if (/^\/(?![/\\])/.test(href) && !href.includes('\\')) return { href, external: false }

  try {
    const url = new URL(href)
    if (url.protocol === 'mailto:') return { href: url.href, external: false }
    if (url.protocol === 'http:' || url.protocol === 'https:')
      return { href: url.href, external: true }
  } catch {
    return null
  }
  return null
}

function safeImageSrc(value: unknown): string | null {
  try {
    const url = new URL(text(value))
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

function toMark(node: JsonObject): RichTextMark | null {
  if (node.type === 'bold') return { type: 'bold' }
  if (node.type === 'italic') return { type: 'italic' }
  if (node.type !== 'link') return null

  const link = safeHref(attrs(node).href)
  return link ? { type: 'link', ...link } : null
}

function toInlines(node: JsonObject): RichTextInline[] {
  return children(node).flatMap((child): RichTextInline[] => {
    if (child.type === 'hardBreak') return [{ type: 'hardBreak' }]
    if (child.type !== 'text' || text(child.text) === '') return []

    const marks = (Array.isArray(child.marks) ? child.marks.filter(isObject) : [])
      .map(toMark)
      .filter((mark) => mark !== null)
    return [{ type: 'text', text: text(child.text), marks }]
  })
}

function toListItems(node: JsonObject): RichTextBlock[][] {
  return children(node)
    .filter((child) => child.type === 'listItem')
    .map(toBlocks)
}

function toBlock(node: JsonObject): RichTextBlock | null {
  switch (node.type) {
    case 'paragraph':
      return { type: 'paragraph', content: toInlines(node) }
    case 'heading':
      return {
        type: 'heading',
        level: Number(attrs(node).level) >= 3 ? 3 : 2,
        content: toInlines(node),
      }
    case 'bulletList':
      return { type: 'bulletList', items: toListItems(node) }
    case 'orderedList': {
      const start = Number(attrs(node).start)
      return {
        type: 'orderedList',
        start: Number.isSafeInteger(start) && start > 0 ? start : 1,
        items: toListItems(node),
      }
    }
    case 'blockquote':
      return { type: 'blockquote', content: toBlocks(node) }
    case 'image': {
      const src = safeImageSrc(attrs(node).src)
      return src ? { type: 'image', src, alt: text(attrs(node).alt) } : null
    }
    default:
      return null
  }
}

function toBlocks(node: JsonObject): RichTextBlock[] {
  return children(node)
    .map(toBlock)
    .filter((block) => block !== null)
}

/** Blocos permitidos do documento Tiptap (`{ type: 'doc', content: [...] }`). */
export function parseRichText(json: unknown): RichTextBlock[] {
  if (!isObject(json) || json.type !== 'doc') return []
  return toBlocks(json)
}

// PUB-006 · ADR 0007: a prévia pública mostra só os 3 primeiros blocos, mesmo que o JSON traga mais.
export const PREVIEW_BLOCKS = 3

export function parseRichTextPreview(json: unknown): RichTextBlock[] {
  return parseRichText(json).slice(0, PREVIEW_BLOCKS)
}
