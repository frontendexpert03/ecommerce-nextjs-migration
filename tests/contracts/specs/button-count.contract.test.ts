import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target'

// Spec: docs/behaviour-spec.md#buttoncount

describe('ButtonCount', () => {
	beforeEach(() => target.reset())

	test('BC-01 shows the item count between "-" and "+"', () => {
		const { root } = target.render('ButtonCount', { itemCount: 3 })

		expect(root).toHaveTextContent(/^-\s*3\s*\+$/)
	})

	test('BC-02 clicking "+" fires increaseCart once', async () => {
		const onIncreaseCart = vi.fn()
		const onDecreaseCart = vi.fn()
		target.render('ButtonCount', {
			itemCount: 1,
			onIncreaseCart,
			onDecreaseCart,
		})

		await userEvent.click(screen.getByText('+'))

		expect(onIncreaseCart).toHaveBeenCalledTimes(1)
		expect(onDecreaseCart).not.toHaveBeenCalled()
	})

	test('BC-03 clicking "-" fires decreaseCart once, with no lower limit of its own', async () => {
		const onIncreaseCart = vi.fn()
		const onDecreaseCart = vi.fn()
		target.render('ButtonCount', {
			itemCount: 0,
			onIncreaseCart,
			onDecreaseCart,
		})

		await userEvent.click(screen.getByText('-'))

		expect(onDecreaseCart).toHaveBeenCalledTimes(1)
		expect(onIncreaseCart).not.toHaveBeenCalled()
	})

	test('BC-04 markup matches the Vue original', async () => {
		const { root } = target.render('ButtonCount', { itemCount: 2 })

		await target.expectGolden(root, 'button-count')
	})
})
