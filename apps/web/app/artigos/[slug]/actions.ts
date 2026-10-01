'use server'

import { headers } from 'next/headers'
import { after } from 'next/server'
import { clientIp } from '@/lib/domain/client-ip'
import { handleDownloadRequest, type DownloadResult } from '@/lib/services/article-download'

// LEAD-007 · Único ponto que grava lead: revalida tudo no server com o schema de LEAD-002.
export async function requestArticleDownload(input: unknown): Promise<DownloadResult> {
  return handleDownloadRequest(input, { ip: clientIp(await headers()), schedule: after })
}
