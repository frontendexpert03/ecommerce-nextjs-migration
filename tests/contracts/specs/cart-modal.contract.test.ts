import { screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'
import { deskmat, keyboard } from '../fixtures'

// Spec: docs/behaviour-spec.md#cartmodal

const { cart } = target

const fillCart = async () => {
	cart.addToCart(keyboard)
	cart.addToCart(keyboard)
	cart.addToCart(deskmat)
	await target.settle()
}

describe('CartModal', () => {
	beforeEach(() => target.reset())

	test('CM-01 when not shown, it stays in the DOM with display: none', () => {
		target.render('CartModal', { show: false })

		expect(screen.getByTestId('cart-modal')).toHaveStyle({ display: 'none' })
	})

	test('CM-02 an empty cart says so, totals $0 and has no checkout button', async () => {
		const { root } = target.render('CartModal', { show: true })

		expect(screen.getByTestId('cart-header')).toHaveTextContent('CART (0)')
		expect(screen.getByTestId('cart-empty-message')).toHaveTextContent(
			'No items in cart.',
		)
		expect(screen.getByTestId('cart-total-section')).toHaveTextContent(
			/TOTAL\s*\$0/,
		)
		expect(screen.queryByTestId('cart-checkout-button')).toBeNull()
		await expectMarkup(root, 'cart-modal-empty')
	})

	test('CM-03 with items: count, one row per product in order, total and checkout link', async () => {
		await fillCart()
		const { root } = target.render('CartModal', { show: true })

		expect(screen.getByTestId('cart-header')).toHaveTextContent('CART (3)')
		expect(screen.queryByTestId('cart-empty-message')).toBeNull()
		const rows = screen.getByTestId('cart-item-container').children
		expect(
			[...rows].map(
				(row) =>
					within(row as HTMLElement).getByText(/XX59|Mythic/).textContent,
			),
		).toEqual(['XX59', 'Mythic'])
		expect(screen.getByTestId('cart-total-section')).toHaveTextContent(
			/TOTAL\s*\$1797/,
		)
		expect(screen.getByTestId('cart-checkout-button')).toHaveAttribute(
			'href',
			'/checkout',
		)
		await expectMarkup(root, 'cart-modal-items')
	})

	test.each(['cart-close-button', 'cart-background'])(
		'CM-04 clicking %s closes the cart and unlocks page scroll',
		async (testId) => {
			cart.cartOn()
			target.render('CartModal', { show: true })

			await userEvent.click(screen.getByTestId(testId))

			expect(cart.read().showCart).toBe(false)
			expect(document.body).not.toHaveClass('overflow-y-hidden')
		},
	)

	test('CM-05 "Delete All" empties the cart', async () => {
		await fillCart()
		target.render('CartModal', { show: true })

		await userEvent.click(screen.getByTestId('cart-delete-all'))
		await target.settle()

		expect(cart.read().cart).toEqual({})
		expect(screen.getByTestId('cart-header')).toHaveTextContent('CART (0)')
		expect(screen.getByTestId('cart-empty-message')).toBeInTheDocument()
	})

	test('CM-06 "Checkout" closes the cart', async () => {
		await fillCart()
		cart.cartOn()
		target.render('CartModal', { show: true })

		await userEvent.click(screen.getByRole('button', { name: 'Checkout' }))

		expect(cart.read().showCart).toBe(false)
	})
})
