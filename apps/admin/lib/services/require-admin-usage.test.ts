import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// SEC-005: toda Server Action e todo route handler do admin começa com requireAdmin().
// login e logout são a exceção: são eles que criam e encerram a sessão.

const APP_ROOT = path.resolve(import.meta.dirname, '../..')
const EXEMPT = new Set([path.join('app', 'auth-actions.ts')])
const SCANNED_DIRS = ['app', 'lib']

function sourceFiles(dir: string): string[] {
  return readdirSync(path.join(APP_ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(relative)
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [relative] : []
  })
}

function isServerEntry(file: string, source: string): boolean {
  return /^['"]use server['"]/.test(source.trimStart()) || /(^|[\\/])route\.ts$/.test(file)
}

function exportedFunctionsWithoutGuard(source: string): string[] {
  const exported = [...source.matchAll(/export async function (\w+)\([^)]*\)[^{]*\{/g)]
  return exported
    .filter((match) => {
      const body = source.slice((match.index ?? 0) + match[0].length)
      return !/^\s*const \w+ = await requireAdmin\(\)/.test(body)
    })
    .map((match) => match[1] ?? '')
}

const serverEntries = SCANNED_DIRS.flatMap(sourceFiles).filter((file) =>
  isServerEntry(file, readFileSync(path.join(APP_ROOT, file), 'utf8')),
)

describe('requireAdmin() em toda Server Action e route handler', () => {
  it('encontra os arquivos de server do admin', () => {
    expect(serverEntries).toContain(path.join('app', 'auth-actions.ts'))
    expect(serverEntries).toContain(path.join('app', 'artigos', 'actions.ts'))
    expect(serverEntries).toContain(path.join('app', 'leads', 'exportar', 'route.ts'))
  })

  it.each(serverEntries.filter((file) => !EXEMPT.has(file)))(
    '%s chama requireAdmin() na primeira linha de cada função exportada',
    (file) => {
      const source = readFileSync(path.join(APP_ROOT, file), 'utf8')

      expect(exportedFunctionsWithoutGuard(source)).toEqual([])
    },
  )
})
