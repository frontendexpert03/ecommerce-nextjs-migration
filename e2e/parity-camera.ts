import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
	expect,
	type Browser,
	type Page,
	type TestInfo,
	type ViewportSize,
} from '@playwright/test'

// Visual parity: one scene is run in the Vue app and in the Next app, in the
// same browser at the same time, and the two screenshots are compared with
// Playwright's toMatchSnapshot. The Vue screenshot is written as the
// expected image, so nothing is stored between runs and no per-OS baseline
// files are needed. On a mismatch, the HTML report shows the expected
// (Vue), actual (Next) and diff images. See docs/adr/0014.

export interface ParityURLs {
	vue: string
	next: string
}

/** Sets up a scene on a fresh tab: open a page, click things. */
export type Scene = (page: Page) => Promise<void>

export class ParityCamera {
	constructor(
		private readonly browser: Browser,
		private readonly viewport: ViewportSize,
		private readonly urls: ParityURLs,
		private readonly testInfo: TestInfo,
	) {}

	/**
	 * Screenshots `scene` in both apps and expects Next to match Vue.
	 * `fullPage: false` captures only the viewport, for fixed overlays such
	 * as the cart and the success modal.
	 */
	async expectSameLook(name: string, scene: Scene, { fullPage = true } = {}) {
		const [expected, actual] = await Promise.all([
			this.shoot(this.urls.vue, scene, fullPage),
			this.shoot(this.urls.next, scene, fullPage),
		])

		const file = `${name}.png`
		const expectedPath = this.testInfo.snapshotPath(file)
		await mkdir(path.dirname(expectedPath), { recursive: true })
		await writeFile(expectedPath, expected)

		expect(
			actual,
			`${name}: the Next app should look like the Vue app`,
		).toMatchSnapshot(file)
	}

	private async shoot(baseURL: string, scene: Scene, fullPage: boolean) {
		const context = await this.browser.newContext({
			baseURL,
			viewport: this.viewport,
		})
		try {
			const page = await context.newPage()
			await scene(page)
			return await page.screenshot({
				fullPage,
				animations: 'disabled',
				caret: 'hide',
			})
		} finally {
			await context.close()
		}
	}
}
