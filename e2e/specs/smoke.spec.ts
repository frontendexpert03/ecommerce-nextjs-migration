import { expect, test } from '@playwright/test'

// Proves both apps start and serve the home page. Real specs replace this in
// Phase 6.
test('home page loads and shows the store name', async ({ page }) => {
	const response = await page.goto('/')

	expect(response?.ok()).toBe(true)
	await expect(page.getByText('KIIIBS').first()).toBeVisible()
})
