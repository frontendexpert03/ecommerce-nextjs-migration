import { preload } from 'react-dom'

/**
 * Starts loading a page's main image (its Largest Contentful Paint) at high
 * priority, from a <link rel="preload"> in the <head>. On category and
 * product pages that image is loading="lazy" in the original, so the
 * browser would otherwise wait for layout before fetching it. The page's
 * own markup is unchanged. See docs/adr/0016.
 */
export function preloadMainImage(src: string) {
  preload(src, { as: 'image', fetchPriority: 'high' })
}
