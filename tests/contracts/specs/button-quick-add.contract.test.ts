import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#buttonquickadd

describe('ButtonQuickAdd', () => {
	beforeEach(() => target.reset())

	test('QA-01 shows the cart icon (loaded lazily) and a "+"', async () => {
		const { root } = target.render('ButtonQuickAdd', {})

		expect(root.querySelector('img')).toHaveAttribute(
			'src',
			'/icons/cart-icon.svg',
		)
		expect(root.querySelector('img')).toHaveAttribute('loading', 'lazy')
		expect(screen.getByRole('button')).toHaveAttribute(
			'data-test',
			'button-quick-add',
		)
		await expectMarkup(root, 'button-quick-add')
	})

	test('QA-02 clicking it fires addToCart once', async () => {
		const onAddToCart = vi.fn()
		target.render('ButtonQuickAdd', { onAddToCart })

		await userEvent.click(screen.getByRole('button'))

		expect(onAddToCart).toHaveBeenCalledOnce()
	})

	test('QA-03 a data-test from the parent replaces its own', () => {
		// As in category-show-box.vue.
		target.render('ButtonQuickAdd', { 'data-test': 'quick-add-keyboards-0' })

		expect(screen.getByRole('button')).toHaveAttribute(
			'data-test',
			'quick-add-keyboards-0',
		)
	})
})
