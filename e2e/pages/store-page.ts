import { expect, type Locator } from '@playwright/test'
import { BasePage } from './base-page'

// What every store page shares: the header with its links, cart badge and
// mobile menu, the cart modal, and the footer. Page classes extend it.

export type Category = 'keyboards' | 'keycaps' | 'deskmats'
export type NavLink = 'Home' | 'Keyboards' | 'Keycaps' | 'Deskmats'

const testName = (link: NavLink) => link.toLowerCase()

export class StorePage extends BasePage {
	// Header
	readonly header = this.byTest('nav-desktop')
	readonly logo = this.byTest('nav-logo')
	readonly hamburger = this.byTest('hamburger')
	readonly cartButton = this.byTest('cart-button')
	readonly cartBubble = this.byTest('cart-bubble')

	desktopLink(link: NavLink): Locator {
		return this.byTest(`nav-${testName(link)}`)
	}

	// Mobile menu
	readonly mobileMenu = this.byTest('nav-mobile')
	readonly closeMenuButton = this.mobileMenu.getByRole('button', {
		name: 'Close',
	})

	mobileLink(link: NavLink): Locator {
		return this.byTest(`mobile-nav-${testName(link)}`)
	}

	// Cart modal
	readonly cartModal = this.byTest('cart-modal')
	readonly cartHeader = this.byTest('cart-header')
	readonly cartCloseButton = this.cartModal.getByRole('button', {
		name: 'Close',
	})
	readonly cartBackground = this.byTest('cart-background')
	readonly deleteAllButton = this.cartModal.getByText('Delete All')
	readonly emptyCartMessage = this.cartModal.getByText('No items in cart.')
	readonly cartTotal = this.byTest('cart-total-section')
	readonly cartCheckoutButton = this.cartModal.getByRole('button', {
		name: 'Checkout',
	})

	/** One row of the cart, found by product name. */
	cartRow(productName: string): Locator {
		return this.byTest('cart-item-container')
			.locator(':scope > div')
			.filter({ has: this.page.getByText(productName, { exact: true }) })
	}

	// Footer
	readonly footer = this.page.getByRole('contentinfo')

	footerLink(link: NavLink): Locator {
		return this.footer.getByRole('link', { name: link, exact: true })
	}

	// Actions

	/**
	 * Waits until a fading element has finished its fade, i.e. no longer has
	 * a v-enter-* or v-leave-* class. Playwright counts an element at
	 * opacity 0 as visible, so toBeVisible() alone can return mid-fade.
	 */
	async waitForFade(element: Locator) {
		await expect(element).not.toHaveClass(/\bv-(enter|leave)-/)
	}

	async openMenu() {
		await this.hamburger.click()
		await expect(this.mobileMenu).toBeVisible()
		await this.waitForFade(this.mobileMenu)
	}

	async closeMenu() {
		await this.closeMenuButton.click()
	}

	/** Uses the desktop links, or the mobile menu on small screens. */
	async goToCategory(category: Category) {
		const link = (category[0].toUpperCase() + category.slice(1)) as NavLink
		if (this.isMobile) {
			await this.openMenu()
			await this.mobileLink(link).click()
		} else {
			await this.desktopLink(link).click()
		}
		await expect(this.page).toHaveURL(`/${category}`)
	}

	async openCart() {
		await this.cartButton.click()
		await expect(this.cartModal).toBeVisible()
		await this.waitForFade(this.cartModal)
	}

	/** The cart's "Checkout": goes to /checkout and waits for the cart to close. */
	async checkoutFromCart() {
		await this.cartCheckoutButton.click()
		await expect(this.page).toHaveURL('/checkout')
		await expect(this.cartModal).toBeHidden()
	}

	async closeCart() {
		await this.cartCloseButton.click()
	}

	/** Clicks the dark area around the cart panel (its top-left corner). */
	async clickCartBackground() {
		await this.cartBackground.click({ position: { x: 5, y: 5 } })
	}

	async increase(productName: string) {
		await this.cartRow(productName).getByText('+', { exact: true }).click()
	}

	async decrease(productName: string) {
		await this.cartRow(productName).getByText('-', { exact: true }).click()
	}
}
