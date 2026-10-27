import { expect, type Locator, type Page } from '@playwright/test'

// Base for every page object. Specs never build locators themselves: each
// page class exposes the elements and actions of its page. Locators use
// Playwright's recommended, auto-waiting queries (getByRole, getByLabel,
// getByText, getByTestId for the original's data-test hooks), so the same
// spec drives the Vue app and the Next app.

/** The `lg` breakpoint: below it the desktop links are hidden. */
const DESKTOP_MIN_WIDTH = 1024

export abstract class BasePage {
	constructor(readonly page: Page) {}

	// Getters, not fields: Babel (which Playwright uses to compile) may run a
	// base class's field initializers before `page` is assigned.

	/** Gets overflow-y-hidden while a modal locks page scroll. */
	get body(): Locator {
		return this.page.locator('body')
	}

	get favicon(): Locator {
		return this.page.locator('link[rel="icon"]')
	}

	get isMobile() {
		return (this.page.viewportSize()?.width ?? 0) < DESKTOP_MIN_WIDTH
	}

	protected byTest(id: string): Locator {
		return this.page.getByTestId(id)
	}

	/** Opens a path and waits until the app responds to clicks. */
	async open(path: string) {
		await this.page.goto(path)
		await this.waitUntilInteractive()
	}

	/**
	 * The Next app sends server-rendered HTML that is visible before React
	 * attaches its event handlers, so a click right after load could be lost.
	 * No locator can see this, so it checks what each framework leaves behind
	 * in a production build:
	 * - Vue renders in the browser and sets __vue_app__ on #app when it
	 *   mounts, so the page is live as soon as #app has content.
	 * - React puts __reactFiber… / __reactProps… on elements it has hydrated.
	 */
	async waitUntilInteractive() {
		await this.page.waitForFunction(() => {
			const app = document.querySelector('#app')
			if (!app) return false
			if ('__vue_app__' in app) return app.childElementCount > 0
			const element = app.querySelector(':scope > div > *')
			return (
				element !== null &&
				Object.keys(element).some((key) => key.startsWith('__react'))
			)
		})
	}

	/**
	 * Runs `action` and returns the message of the alert it opens. The
	 * listener is attached before the action, so a missing alert fails. The
	 * alert is dismissed while the action runs: an open alert blocks the
	 * click that opened it.
	 */
	async alertFrom(action: () => Promise<void>): Promise<string> {
		const [message] = await Promise.all([
			this.page.waitForEvent('dialog').then(async (dialog) => {
				await dialog.dismiss()
				return dialog.message()
			}),
			action(),
		])
		return message
	}

	scrollY() {
		return this.page.evaluate(() => window.scrollY)
	}

	/**
	 * Makes Math.random() return 0.5 on every page this tab opens, so
	 * "You may also like" picks the same products in both apps. Call before
	 * open().
	 */
	async freezeRandomness() {
		await this.page.addInitScript(() => {
			Math.random = () => 0.5
		})
	}

	/**
	 * Gets the page ready for a full-page screenshot: lazy images below the
	 * fold would otherwise never load, and text must use the web font.
	 */
	async prepareForScreenshot() {
		await this.page.evaluate(() => {
			for (const image of document.querySelectorAll('img[loading="lazy"]')) {
				image.setAttribute('loading', 'eager')
			}
		})
		await this.page.waitForLoadState('networkidle')
		await expect
			.poll(() =>
				this.page.evaluate(() =>
					[...document.images].every((image) => image.complete),
				),
			)
			.toBe(true)
		await this.page.evaluate(() => document.fonts.ready)
	}

	meta(name: string): Locator {
		return this.page.locator(`meta[name="${name}"]`)
	}

	ogMeta(property: string): Locator {
		return this.page.locator(`meta[property="og:${property}"]`)
	}
}
