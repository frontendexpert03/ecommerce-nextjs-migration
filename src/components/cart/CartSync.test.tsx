import { render } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, test } from 'vitest'
import { useCartStore } from '@/store/cart-store'
import { CartSync } from './CartSync'

// Shared cart behaviour, including other-tab sync, is covered by
// tests/contracts/specs/cart-store.contract.test.ts. These tests cover how
// the port wires it up.

const savedCart = {
	keycaps1: { product: { id: 1, category: 'keycaps' }, amount: 2 },
}

const initialState = useCartStore.getState()

const saveFromAnotherTab = (cart: object) => {
	const value = JSON.stringify(cart)
	localStorage.setItem('cart', value)
	act(() => {
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'cart',
				newValue: value,
				storageArea: localStorage,
			}),
		)
	})
}

describe('CartSync', () => {
	beforeEach(() => {
		useCartStore.setState(initialState, true)
		localStorage.clear()
	})

	test('renders nothing', () => {
		const { container } = render(<CartSync />)

		expect(container).toBeEmptyDOMElement()
	})

	test('does not load the saved cart before mounting, so server and client HTML match', () => {
		localStorage.setItem('cart', JSON.stringify(savedCart))

		expect(useCartStore.getState().cart).toEqual({})
	})

	test('loads the saved cart on mount', () => {
		localStorage.setItem('cart', JSON.stringify(savedCart))

		render(<CartSync />)

		expect(useCartStore.getState().cart).toEqual(savedCart)
	})

	test('stops following other tabs after unmount', () => {
		const { unmount } = render(<CartSync />)
		saveFromAnotherTab(savedCart)
		expect(useCartStore.getState().cart).toEqual(savedCart)

		unmount()
		saveFromAnotherTab({})

		expect(useCartStore.getState().cart).toEqual(savedCart)
	})
})
