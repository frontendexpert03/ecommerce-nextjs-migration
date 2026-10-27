import { products } from '@/lib/data/products'
import type { Product } from '@/lib/types'

// Port of the Vue app's src/data/product-utils.ts. getCount is not ported:
// nothing uses it.

/**
 * Three random products other than the given one, for "You may also like".
 * Uses the same random-comparator sort as the original, so both apps make
 * the same picks from the same Math.random() values.
 */
export function getSelection(
	productCategory: string,
	productId: number,
): Product[] {
	const items = Object.values(products)
		.flat()
		.filter(
			(item) => !(item.id === productId && item.category === productCategory),
		)

	items.sort(() => Math.random() - 0.5)
	return items.slice(0, 3)
}

export function getProductsOfType(category: string): Product[] {
	return products[category] ?? []
}

// The original throws for an unknown category, which its routes never pass.
// The [category] route can, so this returns null instead.
export function getProduct(category: string, id: number): Product | null {
	return products[category]?.find((item) => item.id === id) ?? null
}
