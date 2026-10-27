import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#buttongoback

describe('ButtonGoBack', () => {
	beforeEach(() => target.reset())
	afterEach(() => {
		vi.restoreAllMocks()
	})

	test('GB-01 shows "Go Back" as a link without an href', async () => {
		const { root } = target.render('ButtonGoBack', {})

		expect(screen.getByText('Go Back')).not.toHaveAttribute('href')
		await expectMarkup(root, 'button-go-back')
	})

	test('GB-02 clicking it goes back one page in the browser history', async () => {
		// history.go(-1) and history.back() are the same step; accept either.
		const go = vi.spyOn(window.history, 'go').mockImplementation(() => {})
		const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
		target.render('ButtonGoBack', {})

		await userEvent.click(screen.getByText('Go Back'))

		const stepsBack =
			back.mock.calls.length -
			go.mock.calls.reduce((sum, [delta = 0]) => sum + delta, 0)
		expect(stepsBack).toBe(1)
	})
})
