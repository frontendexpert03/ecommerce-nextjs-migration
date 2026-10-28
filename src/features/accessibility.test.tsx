import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { CategoryShowBox } from '@/features/category/components/CategoryShowBox'
import { LandingGrid } from '@/features/landing/components/LandingGrid'
import { products } from '@/lib/data/products'
import { YouMayAlsoLike } from '@/components/sections/YouMayAlsoLike'

// Names for the picture-only links, which the original lacks
// (docs/adr/0016). Everything else on these components is covered by the
// contract tests.

describe('picture links are named', () => {
	test('the landing grid names the ZX9 and Kraken pictures', () => {
		render(<LandingGrid />)

		// Testing Library gives <a href=""> no link role (browsers do), so
		// this one is found by its label.
		expect(screen.getByLabelText('ZX9 Keyboard')).toHaveAttribute('href', '')
		expect(
			screen.getByRole('link', { name: 'Kraken deskmat' }),
		).toHaveAttribute('href', '/deskmats/1')
	})

	test('a category show box names its picture after the product', () => {
		render(
			<CategoryShowBox category="keyboards" item={products.keyboards[0]} />,
		)

		expect(screen.getByRole('link', { name: 'XX59 Keyboard' })).toHaveAttribute(
			'href',
			'/keyboards/0',
		)
	})

	test('"You may also like" names each picture after its product', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5)
		render(<YouMayAlsoLike productCategory="keyboards" productId={0} />)

		expect(screen.getByRole('link', { name: 'ZX9 Keyboard' })).toHaveAttribute(
			'href',
			'/keyboards/1',
		)
		vi.restoreAllMocks()
	})

	test('every link on these components has a name', () => {
		render(
			<>
				<LandingGrid />
				<CategoryShowBox category="deskmats" item={products.deskmats[1]} />
			</>,
		)

		for (const link of screen.getAllByRole('link')) {
			expect(link).toHaveAccessibleName()
		}
	})
})
