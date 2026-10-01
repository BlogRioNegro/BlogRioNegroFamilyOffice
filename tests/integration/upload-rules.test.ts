import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { UPLOAD_RULES } from '../../apps/admin/lib/domain/upload-rules'
import { queryLocalDb } from './support/local-supabase'

// DATA-007 · ADR 0022 · A constante de upload do admin tem os mesmos limites e MIME dos buckets.

describe('UPLOAD_RULES × storage.buckets', () => {
  const buckets = queryLocalDb(
    'select id, file_size_limit, allowed_mime_types from storage.buckets order by id',
  )

  it.each(Object.entries(UPLOAD_RULES))('%s tem o mesmo limite e os mesmos tipos', (id, rule) => {
    const bucket = buckets.find((row) => row.id === id)

    expect(Number(bucket?.file_size_limit)).toBe(rule.maxBytes)
    expect(z.array(z.string()).parse(bucket?.allowed_mime_types).sort()).toEqual(
      Object.keys(rule.extensions).sort(),
    )
  })
})
