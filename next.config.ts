import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

// cacheComponents/partialPrefetching are deliberately left off: the catalog
// is fully static, and <Activity>-preserved routes would diverge from the
// Vue app's unmount-on-navigate behaviour. See docs/adr/0002.
const nextConfig: NextConfig = {}

// `npm run analyze` builds with ANALYZE=true and writes treemaps of the
// bundles to .next/analyze/ (client.html, nodejs.html, edge.html). The
// analyzer is a webpack plugin, which is fine: builds use webpack anyway
// (docs/adr/0015).
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

export default withBundleAnalyzer(nextConfig)
