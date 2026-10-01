import { parseRichTextPreview, type RichTextBlock, type RichTextInline } from './rich-text'

// PUB-010 · PUB-012 · Descrição do artigo em metadata, Open Graph e RSS: o resumo; sem resumo,
// rich_text usa ~160 caracteres do texto da prévia e pdf usa a descrição padrão do blog.

export const BLOG_DESCRIPTION =
  'Artigos e estudos para ajudar você a entender o mercado e decidir com mais informação.'

export const DESCRIPTION_MAX_LENGTH = 160

type DescribedArticle = {
  summary: string | null
  content_type: 'pdf' | 'rich_text'
  preview_json: unknown
}

function inlineText(content: RichTextInline[]): string {
  return content.map((inline) => (inline.type === 'text' ? inline.text : ' ')).join('')
}

function blockText(block: RichTextBlock): string {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      return inlineText(block.content)
    case 'bulletList':
    case 'orderedList':
      return block.items.flat().map(blockText).join(' ')
    case 'blockquote':
      return block.content.map(blockText).join(' ')
    case 'image':
      return ''
  }
}

/** Corta na última palavra inteira e fecha com reticências, sem passar do limite. */
function truncate(text: string): string {
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text

  const cut = text.slice(0, DESCRIPTION_MAX_LENGTH - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

export function articleDescription(article: DescribedArticle): string {
  const summary = article.summary?.trim()
  if (summary) return summary
  if (article.content_type === 'pdf') return BLOG_DESCRIPTION

  const text = parseRichTextPreview(article.preview_json)
    .map(blockText)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text ? truncate(text) : BLOG_DESCRIPTION
}
