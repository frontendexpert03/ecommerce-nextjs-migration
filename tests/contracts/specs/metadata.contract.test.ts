import { describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { expectData } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#page-metadata

const { lib } = target

describe('page metadata', () => {
  test('META-01 the landing page has the store title, description and banner', () => {
    expect(lib.getLandingPageMeta()).toEqual({
      title: 'KIIIBS Mechanical Keyboard Store',
      description:
        'We sell custom mechanical keyboards, keycaps and deskmats for your gaming and office setup, right in the heart of Berlin.',
      image: '/icons/KIIIBS-banner.png',
    })
  })

  test('META-02 each category has its own title; an unknown category has none', () => {
    expect(lib.getCategoryPageMeta('keyboards')?.title).toBe(
      'All Mechanical Keyboards | KIIIBS',
    )
    expect(lib.getCategoryPageMeta('keycaps')?.title).toBe(
      'All Custom Keycaps | KIIIBS',
    )
    expect(lib.getCategoryPageMeta('deskmats')?.title).toBe(
      'All Deskmats | KIIIBS',
    )
    expect(lib.getCategoryPageMeta('mice')).toBeUndefined()
  })

  test('META-03 a product title is "<name> <Category, singular> | KIIIBS"', () => {
    const keyboard = lib.getProduct('keyboards', 0)!
    const deskmat = lib.getProduct('deskmats', 0)!

    expect(lib.getProductPageMeta(keyboard)).toEqual({
      title: 'XX59 Keyboard | KIIIBS',
      description: keyboard.text,
      image: keyboard.src,
    })
    expect(lib.getProductPageMeta(deskmat).title).toBe(
      '"Grrr" Deskmat | KIIIBS',
    )
  })

  test('META-04 checkout and 404 pages have their own titles', () => {
    expect(lib.getCheckoutPageMeta().title).toBe('Checkout')
    expect(lib.get404PageMeta()).toEqual({
      title: '404: Page not found.',
      description: '404: Page not found.',
      image: '/icons/KIIIBS-banner.png',
    })
  })

  test('META-05 every page matches the original', async () => {
    const products = Object.values(lib.products).flat()

    await expectData(
      {
        landing: lib.getLandingPageMeta(),
        categories: Object.fromEntries(
          Object.keys(lib.products).map((category) => [
            category,
            lib.getCategoryPageMeta(category),
          ]),
        ),
        products: Object.fromEntries(
          products.map((product) => [
            product.category + product.id,
            lib.getProductPageMeta(product),
          ]),
        ),
        checkout: lib.getCheckoutPageMeta(),
        notFound: lib.get404PageMeta(),
      },
      'metadata',
    )
  })

  test('UTIL-01 capitalize upper-cases the first letter only', () => {
    expect(lib.capitalize('keyboard')).toBe('Keyboard')
    expect(lib.capitalize('k')).toBe('K')
    expect(lib.capitalize('')).toBe('')
  })
})
