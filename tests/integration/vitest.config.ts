import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const support = (file: string) => fileURLToPath(new URL(`./support/${file}`, import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^server-only$/, replacement: support('server-only.ts') },
      { find: /^next\/headers$/, replacement: support('next-headers-without-cookies.ts') },
    ],
  },
  test: {
    include: ['tests/integration/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
})
