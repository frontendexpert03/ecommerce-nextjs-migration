import { describe, expect, test } from 'vitest'
import { getProduct } from './products'

// Shared behaviour is covered by tests/contracts/specs/catalog.contract.test.ts.

describe('getProduct', () => {
	// The original throws here; its routes never pass an unknown category,
	// but the [category]/[id] route can.
	test('returns null for an unknown category', () => {
		expect(getProduct('mice', 0)).toBeNull()
	})
})
