import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// ADR 0007: a leitura pública nunca toca o conteúdo completo. O comportamento contra o banco
// está em tests/integration/public-articles.test.ts.

const read = (file: string) => readFileSync(new URL(file, import.meta.url), 'utf8')

describe('serviço de leitura de artigos', () => {
  it.each(['./articles.ts', './supabase-public.ts'])('%s é server-only', (file) => {
    expect(read(file).startsWith("import 'server-only'\n")).toBe(true)
  })

  it('não referencia article_contents, article-files nem a service role', () => {
    const source = read('./articles.ts') + read('./supabase-public.ts')

    expect(source).not.toMatch(/article_contents|article-files|service-role|SERVICE_ROLE/)
  })
})
