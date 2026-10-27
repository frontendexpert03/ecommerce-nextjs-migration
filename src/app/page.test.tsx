import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from './page'

// Verifies the Vitest + RTL + jest-dom setup. Replaced when the landing
// page is ported in Phase 5.
describe('Home placeholder', () => {
	it('renders the store name', () => {
		render(<Home />)
		expect(screen.getByRole('main')).toHaveTextContent('KIIIBS')
	})
})
