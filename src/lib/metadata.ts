import type { Metadata } from 'next'
import type { Product } from '@/lib/types'
import { capitalize } from '@/lib/utils'

// Port of the Vue app's src/data/meta.ts and meta-utils.ts. The original
// imports the images, which Vite turns back into these same public paths.

export interface PageMeta {
  title: string
  description: string
  image?: string
}

const bannerImage = '/icons/KIIIBS-banner.png'

export const landingPageMeta: PageMeta = {
  title: 'KIIIBS Mechanical Keyboard Store',
  description:
    'We sell custom mechanical keyboards, keycaps and deskmats for your gaming and office setup, right in the heart of Berlin.',
  image: bannerImage,
}

export const categoryPageMeta: Record<string, PageMeta> = {
  keyboards: {
    title: 'All Mechanical Keyboards | KIIIBS',
    description:
      'Explore our selection of high quality mechanical keyboards that will elevate your typing experience.',
    image: '/products/keyboards/cow-full.webp',
  },
  keycaps: {
    title: 'All Custom Keycaps | KIIIBS',
    description:
      'Enjoy typing with style and upgrade your custom mechanical keyboard with our elegant keycaps',
    image: '/products/keycaps/cap2.webp',
  },
  deskmats: {
    title: 'All Deskmats | KIIIBS',
    description:
      'Make yourself comfortable in your work or gaming setup with one of our KIIIBS deskmats. Soft and stylish!',
    image: '/products/deskmats/grrr-full.webp',
  },
}

export const checkoutPageMeta: PageMeta = {
  title: 'Checkout',
  description: 'Complete your purchase.',
  image: bannerImage,
}

export const fofPageMeta: PageMeta = {
  title: '404: Page not found.',
  description: '404: Page not found.',
  image: bannerImage,
}

export function getLandingPageMeta(): PageMeta {
  return landingPageMeta
}

export function getCategoryPageMeta(category: string): PageMeta | undefined {
  return categoryPageMeta[category]
}

// "XX59 Keyboard | KIIIBS": the category, singular and capitalised.
export function getProductPageMeta(product: Product): PageMeta {
  return {
    title:
      product.header +
      ' ' +
      capitalize(product.category.slice(0, -1)) +
      ' ' +
      '| KIIIBS',
    description: product.text,
    image: product.src,
  }
}

export function getCheckoutPageMeta(): PageMeta {
  return checkoutPageMeta
}

export function get404PageMeta(): PageMeta {
  return fofPageMeta
}

/**
 * The tags the original sets with useSeoMeta: title, description,
 * og:title, og:description and og:image. Next makes og:image an absolute
 * URL; the original leaves it relative.
 */
export function toMetadata({ title, description, image }: PageMeta): Metadata {
  return {
    title,
    description,
    openGraph: { title, description, images: image },
  }
}
