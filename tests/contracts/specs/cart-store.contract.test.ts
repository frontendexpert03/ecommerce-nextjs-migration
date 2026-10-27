import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { deskmat, keyboard, withPrice } from '../fixtures'

// Spec: docs/behaviour-spec.md#cart-store

const { cart } = target

describe('cart store', () => {
	beforeEach(() => target.reset())

	test('CART-01 starts empty, closed, with quick add on', () => {
		expect(cart.read()).toEqual({
			cart: {},
			showCart: false,
			showQuickAdd: true,
			cartValue: 0,
			cartLength: 0,
			isEmpty: true,
			firstItem: undefined,
			uniqueItems: 0,
			grandTotal: 50,
			vat: '10.00',
		})
	})

	test('CART-02 adding a new product stores it under category + id with amount 1', () => {
		cart.addToCart(keyboard)

		expect(cart.read().cart).toEqual({
			keyboards0: { product: keyboard, amount: 1 },
		})
	})

	test('CART-03 adding the same product again increases its amount', () => {
		cart.addToCart(keyboard)
		cart.addToCart(keyboard)

		expect(cart.read().cart.keyboards0.amount).toBe(2)
	})

	test('CART-04 removing decreases the amount, and deletes the product at 1', () => {
		cart.addToCart(keyboard)
		cart.addToCart(keyboard)

		cart.removeFromCart(keyboard)
		expect(cart.read().cart.keyboards0.amount).toBe(1)

		cart.removeFromCart(keyboard)
		expect(cart.read().cart).toEqual({})
	})

	test('CART-05 removing a product that is not in the cart changes nothing', () => {
		cart.addToCart(keyboard)

		cart.removeFromCart(deskmat)

		expect(cart.read().cart).toEqual({
			keyboards0: { product: keyboard, amount: 1 },
		})
	})

	test('CART-06 clearCart empties the cart', () => {
		cart.addToCart(keyboard)
		cart.addToCart(deskmat)

		cart.clearCart()

		expect(cart.read()).toMatchObject({
			cart: {},
			isEmpty: true,
			cartLength: 0,
		})
	})

	test('CART-07 totals count every unit; first item is the first one added', () => {
		cart.addToCart(keyboard)
		cart.addToCart(keyboard)
		cart.addToCart(withPrice(deskmat, 25))

		expect(cart.read()).toMatchObject({
			cartValue: 599 * 2 + 25,
			cartLength: 3,
			uniqueItems: 2,
			isEmpty: false,
			firstItem: { product: keyboard, amount: 2 },
		})
	})

	test('CART-08 $50 shipping applies up to and including $1000', () => {
		cart.addToCart(withPrice(keyboard, 500))
		cart.addToCart(withPrice(keyboard, 500))

		expect(cart.read()).toMatchObject({ cartValue: 1000, grandTotal: 1050 })
	})

	test('CART-09 shipping is free above $1000', () => {
		cart.addToCart(withPrice(keyboard, 1001))

		expect(cart.read()).toMatchObject({ cartValue: 1001, grandTotal: 1001 })
	})

	test('CART-10 VAT is 20% of the grand total including shipping, as 2 decimals', () => {
		cart.addToCart(keyboard)

		expect(cart.read()).toMatchObject({ grandTotal: 649, vat: '129.80' })
	})

	test('CART-11 cartOn and cartOff open and close the cart and lock page scroll', () => {
		cart.cartOn()
		expect(cart.read().showCart).toBe(true)
		expect(document.body).toHaveClass('overflow-y-hidden')

		cart.cartOff()
		expect(cart.read().showCart).toBe(false)
		expect(document.body).not.toHaveClass('overflow-y-hidden')
	})

	test('CART-12 saves the cart in localStorage under "cart" as a plain object', async () => {
		cart.addToCart(keyboard)
		cart.addToCart(keyboard)
		await target.settle()

		expect(JSON.parse(localStorage.getItem('cart')!)).toEqual({
			keyboards0: { product: keyboard, amount: 2 },
		})
	})

	test('CART-13 a reload restores the saved cart', async () => {
		localStorage.setItem(
			'cart',
			JSON.stringify({ deskmats1: { product: deskmat, amount: 3 } }),
		)

		await cart.reload()

		expect(cart.read()).toMatchObject({
			cart: { deskmats1: { product: deskmat, amount: 3 } },
			cartLength: 3,
		})
	})
})
