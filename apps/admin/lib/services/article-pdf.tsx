import 'server-only'
import {
  Document,
  Image as PdfPicture,
  Link,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import type { JSONContent } from '@tiptap/core'
import { fileTypeFromBuffer } from 'file-type'
import type { ReactNode } from 'react'

// ADM-008 · ADR 0008 · PDF completo do artigo rich_text: título, capa e todo o conteúdo. O JSON
// já passou por checkRichText (só nós e marcas aprovados). Fontes padrão do PDF (Helvetica e
// Times), que cobrem os acentos do português. Sem cores: o texto sai no preto padrão do PDF.

/** Imagem já baixada; o react-pdf só embute PNG e JPEG. */
export type PdfImage = { data: Buffer; format: 'png' | 'jpg' }

type ArticlePdfInput = {
  title: string
  cover: PdfImage | null
  doc: JSONContent
  /** Imagens do conteúdo por `src`; ausente = formato sem suporte, entra o texto alternativo. */
  images: Map<string, PdfImage>
}

const styles = StyleSheet.create({
  page: { paddingVertical: 56, paddingHorizontal: 64, fontFamily: 'Times-Roman', fontSize: 12 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 24, lineHeight: 1.25, marginBottom: 20 },
  cover: { width: '100%', marginBottom: 24 },
  paragraph: { lineHeight: 1.6, marginBottom: 10 },
  h2: { fontFamily: 'Helvetica-Bold', fontSize: 17, marginTop: 18, marginBottom: 8 },
  h3: { fontFamily: 'Helvetica-Bold', fontSize: 14, marginTop: 14, marginBottom: 6 },
  list: { marginBottom: 10 },
  listItem: { flexDirection: 'row', marginBottom: 4 },
  bullet: { width: 18, lineHeight: 1.6 },
  listBody: { flex: 1 },
  quote: { borderLeftWidth: 2, paddingLeft: 14, marginVertical: 12 },
  quoteText: { fontFamily: 'Times-Italic' },
  image: { marginVertical: 12, maxWidth: '100%' },
  imageAlt: { fontFamily: 'Times-Italic', marginVertical: 12 },
  link: { textDecoration: 'underline' },
})

function markedFont(bold: boolean, italic: boolean, inQuote: boolean): string | undefined {
  const italicNow = italic || inQuote
  if (bold && italicNow) return 'Times-BoldItalic'
  if (bold) return 'Times-Bold'
  if (italicNow) return 'Times-Italic'
  return undefined
}

function renderInline(node: JSONContent, key: number, inQuote: boolean): ReactNode {
  if (node.type === 'hardBreak') return '\n'
  const marks = node.marks ?? []
  const bold = marks.some((mark) => mark.type === 'bold')
  const italic = marks.some((mark) => mark.type === 'italic')
  const href = marks.find((mark) => mark.type === 'link')?.attrs?.href
  const fontFamily = markedFont(bold, italic, inQuote)
  const text = (
    <Text key={key} style={fontFamily ? { fontFamily } : undefined}>
      {node.text ?? ''}
    </Text>
  )
  return typeof href === 'string' ? (
    <Link key={key} src={href} style={styles.link}>
      {text}
    </Link>
  ) : (
    text
  )
}

function inlines(node: JSONContent, inQuote: boolean): ReactNode[] {
  return (node.content ?? []).map((child, index) => renderInline(child, index, inQuote))
}

function renderBlock(
  node: JSONContent,
  key: number,
  images: Map<string, PdfImage>,
  inQuote = false,
): ReactNode {
  const blocks = (parent: JSONContent, quoted = inQuote) =>
    (parent.content ?? []).map((child, index) => renderBlock(child, index, images, quoted))

  switch (node.type) {
    case 'heading':
      return (
        <Text key={key} style={node.attrs?.level === 3 ? styles.h3 : styles.h2}>
          {inlines(node, false)}
        </Text>
      )
    case 'bulletList':
    case 'orderedList': {
      const start = typeof node.attrs?.start === 'number' ? node.attrs.start : 1
      return (
        <View key={key} style={styles.list}>
          {(node.content ?? []).map((item, index) => (
            <View key={index} style={styles.listItem} wrap={false}>
              <Text style={styles.bullet}>
                {node.type === 'orderedList' ? `${start + index}.` : '•'}
              </Text>
              <View style={styles.listBody}>{blocks(item)}</View>
            </View>
          ))}
        </View>
      )
    }
    case 'blockquote':
      return (
        <View key={key} style={styles.quote}>
          {blocks(node, true)}
        </View>
      )
    case 'image': {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : ''
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''
      const image = images.get(src)
      return image ? (
        <PdfPicture key={key} src={image} style={styles.image} />
      ) : (
        <Text key={key} style={styles.imageAlt}>
          [Imagem: {alt}]
        </Text>
      )
    }
    default:
      return (
        <Text key={key} style={[styles.paragraph, inQuote ? styles.quoteText : {}]}>
          {inlines(node, inQuote)}
        </Text>
      )
  }
}

export async function renderArticlePdf({
  title,
  cover,
  doc,
  images,
}: ArticlePdfInput): Promise<Buffer> {
  return renderToBuffer(
    <Document title={title} language="pt-BR">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {cover ? <PdfPicture src={cover} style={styles.cover} /> : null}
        {(doc.content ?? []).map((node, index) => renderBlock(node, index, images))}
      </Page>
    </Document>,
  )
}

/** Imagem para o PDF a partir dos bytes (tipo real pelos magic bytes), ou null se não é PNG/JPEG. */
export async function pdfImage(bytes: Uint8Array): Promise<PdfImage | null> {
  const detected = await fileTypeFromBuffer(bytes)
  if (detected?.mime === 'image/png') return { data: Buffer.from(bytes), format: 'png' }
  if (detected?.mime === 'image/jpeg') return { data: Buffer.from(bytes), format: 'jpg' }
  return null
}
