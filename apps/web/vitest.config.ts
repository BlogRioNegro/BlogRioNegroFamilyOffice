import { createRequire } from 'node:module'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

const serverOnlyEntry = createRequire(import.meta.url).resolve('server-only')

export default defineConfig({
  resolve: {
    alias: [
      { find: /^server-only$/, replacement: path.join(path.dirname(serverOnlyEntry), 'empty.js') },
      { find: /^@\//, replacement: `${import.meta.dirname}/` },
    ],
  },
})
