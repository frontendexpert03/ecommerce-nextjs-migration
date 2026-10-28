import { afterEach, describe, expect, test, vi } from 'vitest'
import type { Product } from '@/lib/types'
import { target } from '@contract-target'
import { expectData } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#catalog

const { lib } = target

const key = (product: Product) => product.category + product.id
const allProducts = () => Object.values(lib.products).flat()

// A small linear congruential generator, so Math.random() gives the same
// sequence in both apps.
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32
    return state / 2 ** 32
  }
}

describe('catalog', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('CAT-01 has 3 keyboards, 2 keycaps and 2 deskmats, identical to the original', async () => {
    expect(Object.keys(lib.products)).toEqual([
      'keyboards',
      'keycaps',
      'deskmats',
    ])
    expect(Object.values(lib.products).map((list) => list.length)).toEqual([
      3, 2, 2,
    ])

    await expectData(lib.products, 'catalog')
  })

  test('CAT-02 getProductsOfType lists a category in order, or [] for an unknown one', () => {
    expect(lib.getProductsOfType('keycaps').map(key)).toEqual([
      'keycaps0',
      'keycaps1',
    ])
    expect(lib.getProductsOfType('mice')).toEqual([])
  })

  test('CAT-03 getProduct finds a product by category and id, or returns null', () => {
    expect(lib.getProduct('keyboards', 2)?.header).toBe('XX99 Mark II')
    expect(lib.getProduct('keyboards', 3)).toBeNull()
    expect(lib.getProduct('keyboards', NaN)).toBeNull()
  })

  test('CAT-04 getSelection returns 3 different products, never the current one', () => {
    for (const product of allProducts()) {
      const picks = lib.getSelection(product.category, product.id).map(key)

      expect(picks).toHaveLength(3)
      expect(new Set(picks).size).toBe(3)
      expect(picks).not.toContain(key(product))
    }
  })

  test('CAT-05 getSelection only excludes the same category and id', () => {
    // A random value of 0.5 makes the comparator return 0, so the sort
    // keeps catalog order and the first three candidates show.
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    expect(lib.getSelection('keyboards', 0).map(key)).toEqual([
      'keyboards1',
      'keyboards2',
      'keycaps0',
    ])
    expect(lib.getSelection('keycaps', 0).map(key)).toEqual([
      'keyboards0',
      'keyboards1',
      'keyboards2',
    ])
  })

  test('CAT-06 the same random numbers give the same picks as the original', async () => {
    vi.spyOn(Math, 'random').mockImplementation(seededRandom(42))

    const picks = Object.fromEntries(
      allProducts().map((product) => [
        key(product),
        lib.getSelection(product.category, product.id).map(key),
      ]),
    )

    await expectData(picks, 'selection')
  })
})
