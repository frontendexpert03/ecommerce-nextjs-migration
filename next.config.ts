import type { NextConfig } from 'next'

// cacheComponents/partialPrefetching are deliberately left off: the catalog
// is fully static, and <Activity>-preserved routes would diverge from the
// Vue app's unmount-on-navigate behaviour. See docs/adr/0002.
const nextConfig: NextConfig = {}

export default nextConfig
