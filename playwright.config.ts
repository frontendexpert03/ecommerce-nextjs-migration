import { defineConfig, type Project } from '@playwright/test'
import path from 'node:path'

/**
 * One suite, two apps. E2E_TARGETS picks which apps the specs run against:
 *   next (default) | vue | next,vue
 * Running both side by side is how we prove the Next.js port behaves like
 * the original Vue app. See docs/adr/0007.
 */
type Target = 'next' | 'vue'

const VUE_APP_DIR =
	process.env.VUE_APP_DIR ?? path.resolve(__dirname, '../E-Commerce-Store')

const apps: Record<Target, { port: number; command: string; cwd: string }> = {
	next: {
		port: 3000,
		command: 'npm run build && npm run start -- --port 3000',
		cwd: __dirname,
	},
	vue: {
		port: 4173,
		command: 'npm run build && npm run preview -- --port 4173 --strictPort',
		cwd: VUE_APP_DIR,
	},
}

// Same viewports the original Cypress suite used (macbook-15 and iphone-7).
const viewports = {
	desktop: { width: 1440, height: 900 },
	mobile: { width: 375, height: 667 },
}

const targets = (process.env.E2E_TARGETS ?? 'next')
	.split(',')
	.map((t) => t.trim())
	.filter((t): t is Target => t === 'next' || t === 'vue')

const projects: Project[] = targets.flatMap((target) =>
	Object.entries(viewports).map(([device, viewport]) => ({
		name: `${target}-${device}`,
		use: {
			baseURL: `http://localhost:${apps[target].port}`,
			viewport,
		},
	})),
)

export default defineConfig({
	testDir: './e2e/specs',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
	use: {
		browserName: 'chromium',
		// Selectors use the data-test attributes that already exist in the Vue app.
		testIdAttribute: 'data-test',
		trace: 'on-first-retry',
	},
	projects,
	webServer: targets.map((target) => ({
		command: apps[target].command,
		cwd: apps[target].cwd,
		url: `http://localhost:${apps[target].port}`,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	})),
})
