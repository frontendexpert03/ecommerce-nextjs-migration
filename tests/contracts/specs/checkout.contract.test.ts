import { screen, waitFor, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'
import { deskmat, keycap, keyboard, withPrice } from '../fixtures'

// Spec: docs/behaviour-spec.md#checkout-page
//
// React also writes a controlled input's value into its `value` attribute;
// Vue only sets the property. The page looks the same, so markup
// comparisons here ignore `value`.
const ignoreValue = { ignoreAttributes: ['value'] }

const { cart, form } = target

const nameField = {
	type: 'text',
	validator: 'empty',
	id: 'name',
	label: 'Name',
	placeholder: 'Alex Keebs',
	errorMessage: 'Characters only.',
	autocomplete: 'off',
	required: true,
} as const

describe('checkout: text input field', () => {
	beforeEach(() => target.reset())

	test('TIF-01 a required field: label with " *", input attributes', async () => {
		const { root } = target.render('TextInputField', nameField)

		expect(screen.getByText('Name')).toHaveTextContent(/^Name\s*\*$/)
		expect(screen.getByLabelText(/Name/)).toHaveAttribute(
			'placeholder',
			'Alex Keebs',
		)
		expect(screen.getByLabelText(/Name/)).toBeRequired()
		await expectMarkup(root, 'text-input-required', ignoreValue)
	})

	test('TIF-02 an optional field has no star and never says "Required."', async () => {
		target.render('TextInputField', { ...nameField, required: false })
		cart.addToCart(keyboard)
		form.submit()
		await target.settle()

		expect(screen.getByText('Name')).toHaveTextContent(/^Name$/)
		expect(screen.getByText('Required.')).not.toBeVisible()
	})

	test('TIF-03 typing stores the value in the form field named by id', async () => {
		target.render('TextInputField', nameField)

		await userEvent.type(screen.getByLabelText(/Name/), 'Alex')

		expect(form.read().name).toBe('Alex')
	})

	test('TIF-04 "Required." shows only after a failed submit, while the field is empty', async () => {
		target.render('TextInputField', nameField)
		expect(screen.getByText('Required.')).not.toBeVisible()

		cart.addToCart(keyboard)
		form.submit()
		await target.settle()

		expect(screen.getByText('Required.')).toBeVisible()
	})

	test('TIF-05 an invalid value shows the error message and a red border', async () => {
		const { root } = target.render('TextInputField', {
			...nameField,
			validator: 'false',
		})

		expect(screen.getByText('Characters only.')).toBeVisible()
		expect(screen.getByLabelText(/Name/)).toHaveClass(
			'border-red-500',
			'focus:border-red-500',
		)
		await expectMarkup(root, 'text-input-invalid', ignoreValue)
	})
})

describe('checkout: form', () => {
	beforeEach(() => target.reset())

	test('CF-01 markup matches the original', async () => {
		const { root } = target.render('CheckoutForm', {})

		await expectMarkup(root, 'checkout-form', ignoreValue)
	})

	test('CF-02 e-Money is selected at first; the buttons switch without submitting the form', async () => {
		const { root } = target.render('CheckoutForm', {})
		const onSubmit = vi.fn()
		root.querySelector('form')!.addEventListener('submit', onSubmit)
		const emoney = screen.getByTestId('form-button-emoney')
		const cash = screen.getByTestId('form-button-cash')
		expect(emoney).toHaveClass('bg-k-main')

		await userEvent.click(cash)
		expect(cash).toHaveClass('bg-k-main')
		expect(emoney).not.toHaveClass('bg-k-main')

		await userEvent.click(emoney)
		expect(emoney).toHaveClass('bg-k-main')
		expect(onSubmit).not.toHaveBeenCalled()
	})

	test('CF-03 the comment box stores what is typed', async () => {
		target.render('CheckoutForm', {})

		await userEvent.type(screen.getByTestId('form-text-area'), 'Ring twice')

		expect(form.read().comment).toBe('Ring twice')
	})

	test('CF-04 the "Add a comment" label points at the country field', async () => {
		target.render('CheckoutForm', {})

		await userEvent.click(screen.getByText('Add a comment'))

		expect(document.activeElement).toBe(
			screen.getByTestId('text-input-field-country'),
		)
	})
})

describe('checkout: summary', () => {
	beforeEach(() => target.reset())
	afterEach(() => {
		vi.restoreAllMocks()
	})

	test('CSI-01 a summary row shows the image, name, price and "x" count; nothing at 0', async () => {
		const { root, rerender } = target.render('CheckoutSummaryItem', {
			cartItem: keyboard,
			itemCount: 2,
		})
		expect(root).toHaveTextContent(/XX59\s*\$ 599\s*x2/)
		await expectMarkup(root, 'checkout-summary-item')

		await rerender({ cartItem: keyboard, itemCount: 0 })
		expect(root.children).toHaveLength(0)
	})

	test('CS-01 an empty cart: $0 total, $50 shipping, $10.00 VAT, $50 grand total', async () => {
		const { root } = target.render('CheckoutSummary', {})

		expect(root).toHaveTextContent(
			/TOTAL\s*\$0\s*SHIPPING\s*\$50\s*VAT \(INCLUDED\)\s*\$10\.00\s*GRAND TOTAL\s*\$50/,
		)
		await expectMarkup(root, 'checkout-summary-empty')
	})

	test('CS-02 rows for each product; shipping is struck through only above $1000', async () => {
		cart.addToCart(withPrice(keyboard, 500))
		cart.addToCart(withPrice(keyboard, 500))
		await target.settle()
		target.render('CheckoutSummary', {})
		expect(screen.getByText('$50')).not.toHaveClass('line-through')

		cart.addToCart(deskmat)
		await target.settle()

		expect(screen.getByText('$50')).toHaveClass('line-through')
		expect(screen.getByTestId('checkout-summary')).toHaveTextContent(
			/GRAND TOTAL\s*\$1599/,
		)
	})

	test('CS-03 markup with items matches the original', async () => {
		cart.addToCart(keyboard)
		cart.addToCart(keyboard)
		cart.addToCart(deskmat)
		await target.settle()
		const { root } = target.render('CheckoutSummary', {})

		await expectMarkup(root, 'checkout-summary-items')
	})

	test('CS-04 "continue & pay" with an empty cart alerts', async () => {
		const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
		target.render('CheckoutSummary', {})

		await userEvent.click(
			screen.getByRole('button', { name: 'continue & pay' }),
		)

		expect(alert).toHaveBeenCalledExactlyOnceWith('Shopping cart is empty!')
	})
})

describe('checkout: success modal', () => {
	beforeEach(() => target.reset())

	const order = async (...products: (typeof keyboard)[]) => {
		for (const product of products) cart.addToCart(product)
		form.bannerOn()
		await target.settle()
	}

	test('SM-01 shows the first product, "and 1 other item" and the grand total', async () => {
		await order(keyboard, keyboard, deskmat)
		const { root } = target.render('CheckoutSuccessModal', {})

		expect(root).toHaveTextContent(/XX59\s*\$599\s*x2/)
		expect(screen.getByText(/and 1 other item/)).toHaveTextContent(
			/^and 1 other items?$/,
		)
		expect(screen.getByText('s')).not.toBeVisible()
		expect(root).toHaveTextContent(/Grand Total\s*\$ 1797/)
		await expectMarkup(root, 'checkout-success-modal')
	})

	test('SM-02 with three products it says "and 2 other items"', async () => {
		await order(keyboard, deskmat, keycap)
		target.render('CheckoutSuccessModal', {})

		expect(screen.getByText('s')).toBeVisible()
	})

	test('SM-03 with one product there is no "other item" line', async () => {
		await order(keyboard)
		const { root } = target.render('CheckoutSuccessModal', {})

		expect(root.querySelector('hr')).toBeNull()
		expect(screen.queryByText(/other item/)).toBeNull()
	})

	test('SM-04 page scroll is locked while it is open', async () => {
		await order(keyboard)
		const { unmount } = target.render('CheckoutSuccessModal', {})
		expect(document.body).toHaveClass('overflow-y-hidden')

		unmount()

		expect(document.body).not.toHaveClass('overflow-y-hidden')
	})

	// Rendered inside the checkout page: the page removes the modal in the
	// same update that empties the cart. On its own, the modal would
	// re-render with no first item and throw, in both apps.
	test.each(['back to home', 'background'])(
		'SM-05 "%s" empties the cart and closes the modal',
		async (control) => {
			await order(keyboard)
			target.render('CheckoutPage', {})
			const modal = screen.getByTestId('checkout-success-modal')

			await userEvent.click(
				control === 'background'
					? modal.querySelector('a')!
					: within(modal).getByRole('button', { name: control }),
			)

			expect(cart.read().cart).toEqual({})
			expect(form.read().showBanner).toBe(false)
			await waitFor(() =>
				expect(screen.queryByTestId('checkout-success-modal')).toBeNull(),
			)
			expect(document.body).not.toHaveClass('overflow-y-hidden')
		},
	)
})

describe('checkout: page', () => {
	beforeEach(() => target.reset())

	test('COP-01 markup matches the original', async () => {
		await target.goTo('/checkout')
		const { root } = target.render('CheckoutPage', {})

		expect(screen.queryByTestId('checkout-success-modal')).toBeNull()
		await expectMarkup(root, 'checkout-page', ignoreValue)
	})

	test('COP-02 filling in the form and paying shows the success modal', async () => {
		cart.addToCart(keyboard)
		await target.settle()
		target.render('CheckoutPage', {})
		const page = within(screen.getByRole('main'))

		await userEvent.type(page.getByLabelText(/Name/), 'Alex Keebs')
		await userEvent.type(page.getByLabelText(/Email/), 'alex@mail.com')
		await userEvent.type(page.getByLabelText(/^Address/), 'Main St. 5')
		await userEvent.type(page.getByLabelText(/Zip/), '10115')
		await userEvent.type(page.getByLabelText(/City/), 'Berlin')
		await userEvent.type(page.getByLabelText(/^Country/), 'Germany')
		await userEvent.click(page.getByRole('button', { name: 'continue & pay' }))

		await waitFor(() =>
			expect(screen.getByTestId('checkout-success-modal')).toBeInTheDocument(),
		)
		expect(document.body).toHaveClass('overflow-y-hidden')
	})
})
