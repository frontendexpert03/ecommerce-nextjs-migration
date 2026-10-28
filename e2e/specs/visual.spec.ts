import { expect, test } from '../fixtures'
import { VALID_ORDER } from '../pages/checkout-page'
import type { StorePage } from '../pages/store-page'

// Every page, and the states that change how a page looks, compared pixel
// by pixel with screenshots of the original Vue app (docs/adr/0014). The
// expected images in e2e/__screenshots__ were recorded from the Vue app by
// the parity recorder (docs/adr/0017); this repo never writes them.
// Screenshots depend on the operating system's font rendering, so these
// tests run on Linux only: in CI, or locally with `npm run test:visual`,
// which uses the same Playwright Docker image the images were recorded in.

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

test.describe('pages look like the original', () => {
	for (const path of PAGES) {
		test(path, async ({ storePage, page }) => {
			await openStill(storePage, path)
			await expect(page).toHaveScreenshot(`${fileName(path)}.png`, {
				fullPage: true,
			})
		})
	}
})

// Fixed overlays (the cart, the menu, the success modal) are compared at
// viewport size only.
test.describe('states look like the original', () => {
	test('cart open with items', async ({ categoryPage, page }) => {
		await openStill(categoryPage, '/keyboards')
		await categoryPage.quickAdd('keyboards', 0, 2)
		await categoryPage.quickAdd('keyboards', 2)
		await categoryPage.openCart()
		await expect(page).toHaveScreenshot('cart-open.png')
	})

	test('mobile menu open', async ({ storePage, page, viewport }) => {
		test.skip(
			(viewport?.width ?? 0) >= 1024,
			'The menu only exists on small screens',
		)
		await openStill(storePage, '/keycaps')
		await storePage.openMenu()
		await expect(page).toHaveScreenshot('menu-open.png')
	})

	test('checkout after a failed payment', async ({
		categoryPage,
		checkoutPage,
		page,
	}) => {
		await openStill(checkoutPage, '/keycaps')
		await categoryPage.quickAdd('keycaps', 0)
		await checkoutPage.openCart()
		await checkoutPage.checkoutFromCart()
		await checkoutPage.fill({ email: 'steve@bruben', country: '10178' })
		await checkoutPage.pay()
		await checkoutPage.prepareForScreenshot()
		await expect(page).toHaveScreenshot('checkout-errors.png', {
			fullPage: true,
		})
	})

	test('order confirmation', async ({ categoryPage, checkoutPage, page }) => {
		await openStill(checkoutPage, '/deskmats')
		await categoryPage.quickAdd('deskmats', 0, 2)
		await categoryPage.quickAdd('deskmats', 1)
		await checkoutPage.openCart()
		await checkoutPage.checkoutFromCart()
		await checkoutPage.fill(VALID_ORDER)
		await checkoutPage.pay()
		await checkoutPage.successModal.waitFor()
		await checkoutPage.prepareForScreenshot()
		await expect(page).toHaveScreenshot('order-confirmation.png')
	})
})
