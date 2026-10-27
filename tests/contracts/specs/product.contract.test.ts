import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target'
import { expectMarkup } from '../harness/assertions'

// Spec: docs/behaviour-spec.md#product-page

const { cart, lib } = target

describe('product page', () => {
	beforeEach(() => target.reset())
	afterEach(() => {
		vi.restoreAllMocks()
	})

	test('PC-01 shows "Go Back", the new-product label, name, text and price', async () => {
		const item = lib.getProduct('keyboards', 0)!
		const { root } = target.render('ProductCore', { item })

		expect(screen.getByText('Go Back')).toBeInTheDocument()
		expect(screen.getByText('new product')).toBeInTheDocument()
		expect(screen.getByRole('heading')).toHaveTextContent(/XX59\s*Keyboard/)
		expect(screen.getByText('$ 599')).toBeInTheDocument()
		await expectMarkup(root, 'product-core')
	})

	test('PC-02 "add to cart" adds one more each click', async () => {
		const item = lib.getProduct('keycaps', 1)!
		target.render('ProductCore', { item })

		await userEvent.click(screen.getByRole('button', { name: 'add to cart' }))
		await userEvent.click(screen.getByRole('button', { name: 'add to cart' }))

		expect(cart.read().cart).toEqual({ keycaps1: { product: item, amount: 2 } })
	})

	test('PF-01 lists the features and what is in the box', async () => {
		const item = lib.getProduct('keyboards', 0)!
		const { root } = target.render('ProductFeatures', {
			features: item.features,
			inthebox: item.inthebox,
		})

		expect(root).toHaveTextContent(/1x\s*KIIBS Carrying Case/)
		await expectMarkup(root, 'product-features')
	})

	test('PIG-01 shows the three gallery images, or nothing if one is missing', async () => {
		const { root, rerender } = target.render('ProductImageGrid', {
			topSrc: '/a.webp',
			botSrc: '/b.webp',
			rightSrc: '/c.webp',
		})
		expect(
			[...root.querySelectorAll('img')].map((img) => img.getAttribute('src')),
		).toEqual(['/a.webp', '/b.webp', '/c.webp'])
		await expectMarkup(root, 'product-image-grid')

		await rerender({ topSrc: '/a.webp', botSrc: '', rightSrc: '/c.webp' })
		expect(root.querySelector('img')).toBeNull()
	})

	test('PP-01 the whole product page matches the original', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5)
		await target.goTo('/deskmats/0')
		const { root } = target.render('ProductPage', {
			category: 'deskmats',
			productId: 0,
		})
		await target.settle()

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
			/"Grrr"\s*Deskmat/,
		)
		await expectMarkup(root, 'product-page-deskmats-0')
	})
})
