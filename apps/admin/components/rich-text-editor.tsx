'use client'

import { Alert, Button, cn, Dialog, DialogContent, TextField } from '@rio-negro/ui'
import type { JSONContent } from '@tiptap/core'
import { UndoRedo } from '@tiptap/extensions'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import { useEffect, useState, type FormEvent } from 'react'
import { uploadArticleImage } from '@/app/artigos/actions'
import { isSafeLinkHref, RICH_TEXT_EXTENSIONS } from '@/lib/domain/rich-text'
import { IMAGE_ACCEPT, sizeError } from '@/lib/domain/upload-rules'

// Tipografia próxima à do artigo no site (apps/web/components/rich-text.tsx).
const CONTENT_CLASSES =
  'min-h-80 rounded-b-control px-4 py-4 font-serif text-md leading-relaxed text-text md:px-6 [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-text [&_blockquote]:pl-6 [&_blockquote]:italic [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-semibold [&_h2:first-child]:mt-0 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-sans [&_h3]:text-md [&_h3]:font-semibold [&_img]:my-6 [&_img]:max-w-full [&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-focus-ring [&_a]:underline [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5'

type Tool = {
  label: string
  isActive: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

const TOOLS: Tool[] = [
  {
    label: 'H2',
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'H3',
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: 'Negrito',
    isActive: (editor) => editor.isActive('bold'),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    label: 'Itálico',
    isActive: (editor) => editor.isActive('italic'),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: 'Lista',
    isActive: (editor) => editor.isActive('bulletList'),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: 'Lista numerada',
    isActive: (editor) => editor.isActive('orderedList'),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
]

const QUOTE: Tool = {
  label: 'Citação',
  isActive: (editor) => editor.isActive('blockquote'),
  run: (editor) => editor.chain().focus().toggleBlockquote().run(),
}

const LINK_ERROR = 'Use um endereço que comece com http://, https://, mailto: ou /.'
const ALT_ERROR = 'Descreva a imagem para quem não pode vê-la.'
const IMAGE_ERROR = 'Escolha uma imagem JPG ou PNG.'

// Os formulários dos diálogos ficam num portal, mas o evento de submit sobe pela árvore do React
// até o formulário do artigo: stopPropagation evita publicar o artigo junto.
function isolate(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  event.stopPropagation()
}

function LinkDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const current: unknown = editor.getAttributes('link').href
  const [error, setError] = useState<string>()

  function apply(event: FormEvent<HTMLFormElement>) {
    isolate(event)
    const href = String(new FormData(event.currentTarget).get('href') ?? '').trim()
    if (!isSafeLinkHref(href)) {
      setError(LINK_ERROR)
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    onClose()
  }

  function remove() {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    onClose()
  }

  return (
    <DialogContent title="Link">
      <form noValidate onSubmit={apply} className="flex flex-col gap-4">
        <TextField
          label="Endereço"
          name="href"
          type="url"
          defaultValue={typeof current === 'string' ? current : ''}
          error={error}
          autoFocus
        />
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          {typeof current === 'string' ? (
            <Button variant="secondary" onClick={remove}>
              Remover link
            </Button>
          ) : null}
          <Button type="submit">Aplicar</Button>
        </div>
      </form>
    </DialogContent>
  )
}

function ImageDialog({
  editor,
  articleId,
  onClose,
}: {
  editor: Editor
  articleId: string
  onClose: () => void
}) {
  const [errors, setErrors] = useState<{ image?: string; alt?: string; upload?: string }>({})
  const [pending, setPending] = useState(false)

  async function insert(event: FormEvent<HTMLFormElement>) {
    isolate(event)
    const formData = new FormData(event.currentTarget)
    const image = formData.get('image')
    const alt = String(formData.get('alt') ?? '').trim()
    const file = image instanceof File && image.size > 0 ? image : null
    const found = {
      image: file ? (sizeError('article-images', file.size) ?? undefined) : IMAGE_ERROR,
      alt: alt ? undefined : ALT_ERROR,
    }
    setErrors(found)
    if (!file || found.image || found.alt) return

    setPending(true)
    const upload = new FormData()
    upload.set('articleId', articleId)
    upload.set('image', file)
    const result = await uploadArticleImage(upload)
    setPending(false)
    if (!result.ok) {
      setErrors({ upload: result.error })
      return
    }
    editor.chain().focus().setImage({ src: result.data.src, alt }).run()
    onClose()
  }

  return (
    <DialogContent title="Imagem">
      <form noValidate onSubmit={insert} className="flex flex-col gap-4">
        {errors.upload ? <Alert variant="error" title={errors.upload} /> : null}
        <TextField
          label="Arquivo"
          name="image"
          type="file"
          accept={IMAGE_ACCEPT}
          help="JPG ou PNG, até 2 MB."
          error={errors.image}
          disabled={pending}
        />
        <TextField
          label="Texto alternativo"
          name="alt"
          help="Descreve a imagem para leitores de tela. Obrigatório."
          error={errors.alt}
          disabled={pending}
        />
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Button type="submit" loading={pending}>
            Inserir
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

/** ADM-005 · Editor Tiptap com as extensões aprovadas; o JSON vai no campo `body`. */
export function RichTextEditor({
  articleId,
  labelId,
  describedBy,
  initialContent,
  invalid,
}: {
  articleId: string
  labelId: string
  describedBy: string
  initialContent: JSONContent | null
  invalid: boolean
}) {
  const [body, setBody] = useState(() => (initialContent ? JSON.stringify(initialContent) : ''))
  const [dialog, setDialog] = useState<'link' | 'image' | null>(null)

  const editor = useEditor({
    extensions: [...RICH_TEXT_EXTENSIONS, UndoRedo],
    content: initialContent,
    immediatelyRender: false,
    // O CSS do Tiptap entra por globals.css: a CSP bloqueia <style> injetado sem nonce.
    injectCSS: false,
    onUpdate: ({ editor: current }) => setBody(JSON.stringify(current.getJSON())),
  })

  // Os atributos acompanham o erro do campo (aria-invalid) depois da criação do editor.
  useEffect(() => {
    editor?.setOptions({
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-labelledby': labelId,
          'aria-describedby': describedBy,
          ...(invalid ? { 'aria-invalid': 'true' } : {}),
          class: CONTENT_CLASSES,
        },
      },
    })
  }, [editor, labelId, describedBy, invalid])

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? Object.fromEntries([
            ...[...TOOLS, QUOTE].map((tool) => [tool.label, tool.isActive(current)]),
            ['Link', current.isActive('link')],
          ])
        : {},
  })

  function toolButton(tool: Tool) {
    return (
      <Button
        key={tool.label}
        variant="ghost"
        size="sm"
        aria-pressed={active?.[tool.label] ?? false}
        disabled={!editor}
        onClick={() => editor && tool.run(editor)}
      >
        {tool.label}
      </Button>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-control border border-border-strong bg-surface',
        invalid && 'border-error',
      )}
    >
      <input type="hidden" name="body" value={body} />
      <div
        role="toolbar"
        aria-label="Formatação"
        className="flex flex-wrap gap-1 border-b border-border p-2"
      >
        {TOOLS.map(toolButton)}
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={active?.Link ?? false}
          disabled={!editor}
          onClick={() => setDialog('link')}
        >
          Link
        </Button>
        {toolButton(QUOTE)}
        <Button variant="ghost" size="sm" disabled={!editor} onClick={() => setDialog('image')}>
          Imagem
        </Button>
      </div>
      <EditorContent editor={editor} />
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        {editor && dialog === 'link' ? (
          <LinkDialog editor={editor} onClose={() => setDialog(null)} />
        ) : null}
        {editor && dialog === 'image' ? (
          <ImageDialog editor={editor} articleId={articleId} onClose={() => setDialog(null)} />
        ) : null}
      </Dialog>
    </div>
  )
}
