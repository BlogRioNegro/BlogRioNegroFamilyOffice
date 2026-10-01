import { cn } from '@rio-negro/ui'
import { Fragment, type ReactNode } from 'react'
import type { RichTextBlock, RichTextInline } from '@/lib/domain/rich-text'

// SEC-007 · Renderiza a árvore sanitizada por parseRichText. Texto e atributos passam pelo
// escape do React; nenhum HTML vindo do banco é injetado (ADR 0025).

const EXTERNAL_REL = 'noopener noreferrer nofollow'

function renderInline(inline: RichTextInline): ReactNode {
  if (inline.type === 'hardBreak') return <br />

  return inline.marks.reduce<ReactNode>((node, mark) => {
    if (mark.type === 'bold') return <strong className="font-bold">{node}</strong>
    if (mark.type === 'italic') return <em>{node}</em>
    return (
      <a
        href={mark.href}
        rel={mark.external ? EXTERNAL_REL : undefined}
        className="underline underline-offset-3 hover:decoration-2"
      >
        {node}
      </a>
    )
  }, inline.text)
}

function renderInlines(content: RichTextInline[]): ReactNode[] {
  return content.map((inline, index) => <Fragment key={index}>{renderInline(inline)}</Fragment>)
}

function renderListItems(items: RichTextBlock[][]): ReactNode[] {
  return items.map((item, index) => (
    <li key={index} className="mb-[0.4em]">
      {renderBlocks(item, true)}
    </li>
  ))
}

function renderBlock(block: RichTextBlock, key: number, inList: boolean): ReactNode {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={key} className={cn('text-pretty', inList ? 'mb-0' : 'mb-[1.2em]')}>
          {renderInlines(block.content)}
        </p>
      )
    case 'heading':
      return block.level === 2 ? (
        <h2 key={key} className="mt-[2em] mb-[0.6em] font-sans text-xl font-semibold first:mt-0">
          {renderInlines(block.content)}
        </h2>
      ) : (
        <h3
          key={key}
          className="mt-[1.6em] mb-[0.5em] font-sans text-md leading-snug font-semibold first:mt-0"
        >
          {renderInlines(block.content)}
        </h3>
      )
    case 'bulletList':
      return (
        <ul key={key} className="mb-[1.2em] list-disc pl-[1.25em]">
          {renderListItems(block.items)}
        </ul>
      )
    case 'orderedList':
      return (
        <ol key={key} start={block.start} className="mb-[1.2em] list-decimal pl-[1.25em]">
          {renderListItems(block.items)}
        </ol>
      )
    case 'blockquote':
      return (
        <blockquote key={key} className="my-[1.6em] border-l-2 border-text pl-6 italic">
          {renderBlocks(block.content, false)}
        </blockquote>
      )
    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element -- next/image injeta style inline, bloqueado pela CSP (ADR 0020)
        <img key={key} src={block.src} alt={block.alt} loading="lazy" className="mb-[1.2em]" />
      )
  }
}

function renderBlocks(blocks: RichTextBlock[], inList: boolean): ReactNode[] {
  return blocks.map((block, index) => renderBlock(block, index, inList))
}

export function RichText({ blocks, className }: { blocks: RichTextBlock[]; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-(--measure-article) font-serif text-(length:--font-size-article) leading-(--line-height-article)',
        className,
      )}
    >
      {renderBlocks(blocks, false)}
    </div>
  )
}
