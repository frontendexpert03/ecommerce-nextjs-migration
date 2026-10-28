import { test as base } from '@playwright/test'
import { CategoryPage } from './pages/category-page'
import { CheckoutPage } from './pages/checkout-page'
import { LandingPage } from './pages/landing-page'
import { NotFoundPage } from './pages/not-found-page'
import { ProductPage } from './pages/product-page'
import { StorePage } from './pages/store-page'

// Specs import `test` from here and receive page objects as fixtures. All
// page objects share the test's `page`, so a spec can move from one to the
// next as the user navigates.
export const test = base.extend<{
	storePage: StorePage
	landingPage: LandingPage
	categoryPage: CategoryPage
	productPage: ProductPage
	checkoutPage: CheckoutPage
	notFoundPage: NotFoundPage
}>({
	storePage: async ({ page }, provide) => provide(new StorePage(page)),
	landingPage: async ({ page }, provide) => provide(new LandingPage(page)),
	categoryPage: async ({ page }, provide) => provide(new CategoryPage(page)),
	productPage: async ({ page }, provide) => provide(new ProductPage(page)),
	checkoutPage: async ({ page }, provide) => provide(new CheckoutPage(page)),
	notFoundPage: async ({ page }, provide) => provide(new NotFoundPage(page)),
})

export { expect } from '@playwright/test'

const DESKTOP_MIN_WIDTH = 1024

/** Skips the calling test or group unless the viewport is below `lg`. */
export const mobileOnly = () =>
	test.skip(
		({ viewport }) => (viewport?.width ?? 0) >= DESKTOP_MIN_WIDTH,
		'Small screens only',
	)

/** Skips the calling test or group unless the viewport is `lg` or wider. */
export const desktopOnly = () =>
	test.skip(
		({ viewport }) => (viewport?.width ?? 0) < DESKTOP_MIN_WIDTH,
		'Large screens only',
	)
