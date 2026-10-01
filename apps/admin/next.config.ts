import type { NextConfig } from 'next'
import { ARTICLE_FORM_MAX_BYTES } from './lib/domain/upload-rules'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  { key: 'X-Robots-Tag', value: 'noindex' },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  transpilePackages: ['@rio-negro/db', '@rio-negro/ui'],
  // ADM-006 · O formulário de artigo leva capa + PDF numa Server Action; os padrões (1 MB na
  // action, 10 MB no proxy) são menores que os limites dos buckets.
  experimental: {
    serverActions: { bodySizeLimit: ARTICLE_FORM_MAX_BYTES },
    proxyClientMaxBodySize: ARTICLE_FORM_MAX_BYTES,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
