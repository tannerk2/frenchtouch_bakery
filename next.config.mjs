import { readFileSync } from 'node:fs'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

const { siteUrl } = JSON.parse(readFileSync(new URL('./lib/aws-config.json', import.meta.url), 'utf8'))

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      images: { unoptimized: true },
      // Menu, events and gallery content lives in the deployed content bucket, so proxy it in development.
      async rewrites() {
        if (!siteUrl) return []
        return [
          { source: '/data/:path*', destination: `${siteUrl}/data/:path*` },
          { source: '/uploads/:path*', destination: `${siteUrl}/uploads/:path*` },
        ]
      },
    }
  }

  return {
    // Plain HTML/JS files for S3 + CloudFront (see infra/). Editable content is fetched from /data at runtime.
    output: 'export',
    images: { unoptimized: true },
  }
}
