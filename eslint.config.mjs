import path from 'node:path'
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const appDir = (name) => path.join(import.meta.dirname, 'apps', name).replaceAll('\\', '/')

export default defineConfig([
  {
    files: ['apps/**'],
    extends: [nextVitals],
    settings: {
      next: { rootDir: [appDir('web'), appDir('admin')] },
    },
  },
  {
    extends: [nextTs],
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  globalIgnores([
    'design/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/node_modules/**',
    '**/next-env.d.ts',
  ]),
])
