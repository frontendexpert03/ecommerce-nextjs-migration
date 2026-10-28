import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Footer } from './Footer'
import { Navigation } from './Navigation'

// Names for the icon-only controls, which the original lacks (docs/adr/0016).
// The rest of these components is covered by the contract tests.

describe('layout accessibility', () => {
	test('the hamburger button is named "Open menu"', () => {
		render(<Navigation />)

		expect(
			screen.getByRole('button', { name: 'Open menu' }),
		).toBeInTheDocument()
	})

	test('the footer social icons are named after their networks', () => {
		render(<Footer />)

		// Testing Library gives <a href=""> no link role (browsers do), so the
		// links are found by their labels.
		for (const network of ['Facebook', 'Twitter', 'Instagram']) {
			const link = screen.getByLabelText(network)
			expect(link.tagName).toBe('A')
			expect(link).toHaveAttribute('href', '')
		}
	})

	test('every link in the navigation and footer has a name', () => {
		render(
			<>
				<Navigation />
				<Footer />
			</>,
		)

		for (const link of screen.getAllByRole('link')) {
			expect(link).toHaveAccessibleName()
		}
	})
})
