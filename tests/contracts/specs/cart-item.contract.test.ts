import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { deskmat, keyboard } from '../fixtures'

// Spec: docs/behaviour-spec.md#cartitem

describe('CartItem', () => {
	beforeEach(() => target.reset())

	test('CI-01 renders nothing when the count is 0', () => {
		const { root } = target.render('CartItem', {
			cartItem: keyboard,
			itemCount: 0,
		})

		expect(root.children).toHaveLength(0)
	})

	test('CI-02 shows the product image, name, price and count', () => {
		const { root } = target.render('CartItem', {
			cartItem: keyboard,
			itemCount: 2,
		})

		expect(root.querySelector('img')).toHaveAttribute('src', keyboard.src)
		expect(screen.getByText('XX59')).toBeInTheDocument()
		expect(screen.getByText('$ 599')).toBeInTheDocument()
		expect(screen.getByText('2')).toBeInTheDocument()
	})

	test('CI-03 "+" adds one more of that product to the cart', async () => {
		target.cart.addToCart(keyboard)
		target.render('CartItem', { cartItem: keyboard, itemCount: 1 })

		await userEvent.click(screen.getByText('+'))

		expect(target.cart.read().cart.keyboards0.amount).toBe(2)
	})

	test('CI-04 "-" takes one of that product out of the cart', async () => {
		target.cart.addToCart(keyboard)
		target.cart.addToCart(keyboard)
		target.render('CartItem', { cartItem: keyboard, itemCount: 2 })

		await userEvent.click(screen.getByText('-'))

		expect(target.cart.read().cart.keyboards0.amount).toBe(1)
	})

	test('CI-05 "-" on the last one removes the product and leaves others alone', async () => {
		target.cart.addToCart(keyboard)
		target.cart.addToCart(deskmat)
		target.render('CartItem', { cartItem: keyboard, itemCount: 1 })

		await userEvent.click(screen.getByText('-'))

		expect(Object.keys(target.cart.read().cart)).toEqual(['deskmats1'])
	})

	test('CI-06 markup matches the Vue original', async () => {
		const { root } = target.render('CartItem', {
			cartItem: keyboard,
			itemCount: 2,
		})

		await target.expectGolden(root, 'cart-item')
	})
})
