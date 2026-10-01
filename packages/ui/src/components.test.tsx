import { readFileSync } from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import * as ui from './index'
import {
  Alert,
  Button,
  Checkbox,
  FieldMessage,
  Label,
  StatusBadge,
  Table,
  TableCaption,
  TextField,
  TypeBadge,
} from './index'

// DS-004: componentes base com os tokens; a lista é a da seção Componentes da spec 06.

const render = renderToStaticMarkup

describe('Button', () => {
  it('é type="button" e primário por padrão', () => {
    const html = render(<Button>Salvar</Button>)

    expect(html).toContain('type="button"')
    expect(html).toContain('bg-action-primary')
  })

  it('em loading fica desabilitado, com aria-busy e spinner', () => {
    const html = render(<Button loading>Enviando…</Button>)

    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('animate-spin')
  })

  it('asChild aplica o estilo ao link', () => {
    const html = render(
      <Button asChild variant="secondary">
        <a href="/artigos">Ver artigos</a>
      </Button>,
    )

    expect(html).toMatch(/^<a [^>]*href="\/artigos"/)
    expect(html).toContain('border-border-strong')
  })

  it('link não herda a altura nem o padding do tamanho', () => {
    const html = render(<Button variant="link">Todos os artigos</Button>)

    expect(html).toContain('h-auto p-0')
    expect(html).not.toMatch(/px-4|h-\(--control-height\)/)
  })
})

describe('TextField', () => {
  it('liga label, campo e ajuda', () => {
    const html = render(<TextField id="email" label="E-mail" help="Enviaremos o PDF." />)

    expect(html).toContain('for="email"')
    expect(html).toContain('aria-describedby="email-mensagem"')
    expect(html).toContain('id="email-mensagem"')
    expect(html).not.toContain('aria-invalid="')
  })

  it('no erro marca aria-invalid e troca a ajuda pela mensagem com ícone', () => {
    const html = render(
      <TextField id="email" label="E-mail" help="Ajuda" error="Informe um e-mail válido." />,
    )

    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('Informe um e-mail válido.')
    expect(html).not.toContain('Ajuda')
    expect(html).toContain('<svg')
  })
})

describe('Label e FieldMessage', () => {
  it('Label opcional acrescenta o texto', () => {
    expect(render(<Label optional>Empresa</Label>)).toContain('(opcional)')
  })

  it('FieldMessage de erro tem ícone e não depende só da cor', () => {
    expect(render(<FieldMessage variant="error">Erro</FieldMessage>)).toContain('<svg')
    expect(render(<FieldMessage>Ajuda</FieldMessage>)).not.toContain('<svg')
  })
})

describe('Checkbox', () => {
  it('não vem marcado e liga a label à caixa', () => {
    const html = render(<Checkbox id="consentimento">Li e concordo</Checkbox>)

    expect(html).toContain('aria-checked="false"')
    expect(html).toContain('for="consentimento"')
  })

  it('no erro marca aria-invalid e descreve o erro', () => {
    const html = render(
      <Checkbox id="consentimento" error="Você precisa aceitar para continuar.">
        Li e concordo
      </Checkbox>,
    )

    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-describedby="consentimento-erro"')
  })
})

describe('Alert', () => {
  it('erro usa role="alert"; sucesso e aviso usam role="status"', () => {
    expect(render(<Alert variant="error" title="Falhou" />)).toContain('role="alert"')
    expect(render(<Alert variant="success" title="Pronto" />)).toContain('role="status"')
    expect(render(<Alert variant="warning" title="Atenção" />)).toContain('role="status"')
  })
})

describe('badges', () => {
  it('StatusBadge traz o texto de cada status', () => {
    const labels = (['disabled', 'pending', 'sent', 'failed'] as const).map((status) =>
      render(<StatusBadge status={status} />),
    )

    expect(labels.join()).toMatch(/Desativado.*Pendente.*Enviado.*Falhou/)
  })

  it('TypeBadge traz PDF ou Texto', () => {
    expect(render(<TypeBadge type="pdf" />)).toContain('PDF')
    expect(render(<TypeBadge type="rich_text" />)).toContain('Texto')
  })
})

describe('Table', () => {
  it('tem legenda acessível', () => {
    const html = render(
      <Table>
        <TableCaption>Artigos</TableCaption>
      </Table>,
    )

    expect(html).toContain('<caption class="sr-only">Artigos</caption>')
  })
})

describe('spec 06 · Componentes', () => {
  it('lista exatamente os componentes exportados por @rio-negro/ui', () => {
    const spec = readFileSync(
      path.resolve(import.meta.dirname, '../../../docs/specs/06-design-system.md'),
      'utf8',
    )
    const section = spec.split('## Componentes')[1]?.split('\n## ')[0] ?? ''
    const listed = [...section.matchAll(/^\| `(\w+)` \|/gm)].map((match) => match[1]).sort()
    const exported = Object.keys(ui)
      .filter((name) => /^[A-Z]/.test(name))
      .sort()

    expect(listed).toEqual(exported)
  })
})
