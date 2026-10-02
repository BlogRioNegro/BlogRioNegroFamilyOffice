import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// DS-003: packages/ui (verdade no código), o export do Claude Design e a spec 06 (verdade na
// documentação) precisam ter os mesmos tokens, com os mesmos valores.

const ROOT = path.resolve(import.meta.dirname, '../../..')
const read = (relative: string) => readFileSync(path.join(ROOT, relative), 'utf8')

type Tokens = Map<string, string>

// Iguala a formatação do Prettier: caixa do hex, espaços e zero à esquerda (0.48 → .48).
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/(^|[^\d])0\./g, '$1.')
}

function declarations(css: string): Tokens {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const tokens: Tokens = new Map()
  for (const match of withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
    const [, name, value] = match
    if (name && value && !name.includes('*')) tokens.set(name, normalize(value))
  }
  return tokens
}

function splitMedia(css: string): { base: string; media: string } {
  const [base = '', ...media] = css.split('@media')
  return { base, media: media.join('@media') }
}

function designTokens() {
  const files = ['colors.css', 'spacing.css', 'typography.css'].map((file) =>
    read(`design/design-system/tokens/${file}`),
  )
  const parts = files.map(splitMedia)
  return {
    base: declarations(parts.map((part) => part.base).join('\n')),
    media: declarations(parts.map((part) => part.media).join('\n')),
  }
}

function uiTokens() {
  const tokensCss = splitMedia(read('packages/ui/src/tokens.css'))
  const themeStatic = read('packages/ui/src/theme.css').split('@theme inline')[0] ?? ''
  return {
    base: declarations(`${tokensCss.base}\n${themeStatic}`),
    media: declarations(tokensCss.media),
  }
}

// next/font expõe a família como variável; o resto da pilha é a do export.
const FONT_FAMILY_FROM_NEXT_FONT: Record<string, [string, string]> = {
  '--font-sans': ["'roboto'", 'var(--font-roboto)'],
  '--font-serif': ["'robotoslab'", 'var(--font-roboto-slab)'],
}

function expectedUiValue(name: string, designValue: string): string {
  const font = FONT_FAMILY_FROM_NEXT_FONT[name]
  return font ? designValue.replace(font[0], font[1]) : designValue
}

function specTokens(): Tokens {
  const spec = read('docs/specs/06-design-system.md')
  const section = spec.split('## Tokens')[1]?.split('\n## ')[0] ?? ''
  const tokens: Tokens = new Map()
  for (const match of section.matchAll(/^\| `(--[\w-]+)` \| `([^`]+)` \|/gm)) {
    const [, name, value] = match
    if (name && value) tokens.set(name, normalize(value))
  }
  return tokens
}

describe('tokens do design system', () => {
  const design = designTokens()
  const ui = uiTokens()

  it('o export tem tokens para comparar', () => {
    expect(design.base.size).toBeGreaterThan(80)
  })

  it('packages/ui tem exatamente os tokens do export, com os mesmos valores', () => {
    const expected = new Map(
      [...design.base].map(([name, value]) => [name, expectedUiValue(name, value)]),
    )

    expect(Object.fromEntries(ui.base)).toEqual(Object.fromEntries(expected))
  })

  it('os ajustes de breakpoint do export também estão em packages/ui', () => {
    expect(Object.fromEntries(ui.media)).toEqual(Object.fromEntries(design.media))
  })

  it('a tabela Tokens da spec 06 concorda com packages/ui', () => {
    expect(Object.fromEntries(specTokens())).toEqual(Object.fromEntries(ui.base))
  })
})

describe('nenhuma cor ou fonte fora de packages/ui', () => {
  const FORBIDDEN = [/#[0-9a-f]{3,8}\b/i, /\brgba?\(/i, /font-family/i]

  function sourceFiles(dir: string): string[] {
    return readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
      const relative = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return ['node_modules', '.next'].includes(entry.name) ? [] : sourceFiles(relative)
      }
      return /\.(tsx?|css|mjs)$/.test(entry.name) ? [relative] : []
    })
  }

  it('apps/ não tem hex, rgb() nem font-family', () => {
    const offenders = sourceFiles('apps').filter((file) =>
      FORBIDDEN.some((pattern) => pattern.test(read(file))),
    )

    expect(offenders).toEqual([])
  })
})
