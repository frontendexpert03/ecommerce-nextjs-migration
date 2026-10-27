import { test } from '../fixtures'
import { CategoryPage } from '../pages/category-page'
import { CheckoutPage, VALID_ORDER } from '../pages/checkout-page'
import { StorePage } from '../pages/store-page'

// Every page, and the states that change how a page looks, screenshotted in
// both apps and compared pixel by pixel (docs/adr/0014). Runs in the
// visual-desktop and visual-mobile projects, which need both apps running.

const PAGES = [
	'/',
	'/keyboards',
	'/keycaps',
	'/deskmats',
	'/keyboards/0',
	'/keyboards/1',
	'/keyboards/2',
	'/keycaps/0',
	'/keycaps/1',
	'/deskmats/0',
	'/deskmats/1',
	'/checkout',
	'/404',
]

const fileName = (path: string) =>
	path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')

/** Opens a path with randomness frozen and everything loaded. */
const openStill = async (store: StorePage, path: string) => {
	await store.freezeRandomness()
	await store.open(path)
	await store.prepareForScreenshot()
}

test.describe('pages look the same', () => {
	for (const path of PAGES) {
		test(path, async ({ parity }) => {
			await parity.expectSameLook(fileName(path), (page) =>
				openStill(new StorePage(page), path),
			)
		})
	}
})

test.describe('states look the same', () => {
	test('cart open with items', async ({ parity }) => {
		await parity.expectSameLook(
			'cart-open',
			async (page) => {
				const store = new CategoryPage(page)
				await openStill(store, '/keyboards')
				await store.quickAdd('keyboards', 0, 2)
				await store.quickAdd('keyboards', 2)
				await store.openCart()
			},
			{ fullPage: false },
		)
	})

	test('mobile menu open', async ({ parity, viewport }) => {
		test.skip(
			(viewport?.width ?? 0) >= 1024,
			'The menu only exists on small screens',
		)
		await parity.expectSameLook(
			'menu-open',
			async (page) => {
				const store = new StorePage(page)
				await openStill(store, '/keycaps')
				await store.openMenu()
			},
			{ fullPage: false },
		)
	})

	test('checkout after a failed payment', async ({ parity }) => {
		await parity.expectSameLook('checkout-errors', async (page) => {
			const checkout = new CheckoutPage(page)
			await openStill(checkout, '/keycaps')
			await new CategoryPage(page).quickAdd('keycaps', 0)
			await checkout.openCart()
			await checkout.checkoutFromCart()
			await checkout.fill({ email: 'steve@bruben', country: '10178' })
			await checkout.pay()
			await checkout.prepareForScreenshot()
		})
	})

	test('order confirmation', async ({ parity }) => {
		await parity.expectSameLook(
			'order-confirmation',
			async (page) => {
				const checkout = new CheckoutPage(page)
				await openStill(checkout, '/deskmats')
				const deskmats = new CategoryPage(page)
				await deskmats.quickAdd('deskmats', 0, 2)
				await deskmats.quickAdd('deskmats', 1)
				await checkout.openCart()
				await checkout.checkoutFromCart()
				await checkout.fill(VALID_ORDER)
				await checkout.pay()
				await checkout.successModal.waitFor()
				await checkout.prepareForScreenshot()
			},
			{ fullPage: false },
		)
	})
})
