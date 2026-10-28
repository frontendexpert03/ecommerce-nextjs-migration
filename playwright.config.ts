import { defineConfig, type Project } from '@playwright/test'
import path from 'node:path'

/**
 * One suite, two apps. E2E_TARGETS picks which apps the specs run against:
 *   next (default) | vue | next,vue
 * Running both side by side is how we prove the Next.js port behaves like
 * the original Vue app. See docs/adr/0007.
 *
 * With both apps, the visual-* projects also compare screenshots of the two
 * apps (docs/adr/0014).
 */
type Target = 'next' | 'vue'

const VUE_APP_DIR =
	process.env.VUE_APP_DIR ?? path.resolve(__dirname, '../E-Commerce-Store')

// Both apps are tested as production builds (next build + next start,
// vite build + vite preview), never as dev servers. The ports are not the
// dev servers' defaults (3000 and 5173), so a running `npm run dev` can't be
// picked up by reuseExistingServer by mistake.
const apps: Record<Target, { port: number; command: string; cwd: string }> = {
	next: {
		port: 3100,
		command: 'npm run build && npm run start -- --port 3100',
		cwd: __dirname,
	},
	vue: {
		port: 4173,
		command: 'npm run build && npm run preview -- --port 4173 --strictPort',
		cwd: VUE_APP_DIR,
	},
}

const url = (target: Target) => `http://localhost:${apps[target].port}`

// Same viewports the original Cypress suite used (macbook-15 and iphone-7).
const viewports = {
	desktop: { width: 1440, height: 900 },
	mobile: { width: 375, height: 667 },
}

const targets = (process.env.E2E_TARGETS ?? 'next')
	.split(',')
	.map((t) => t.trim())
	.filter((t): t is Target => t === 'next' || t === 'vue')

const VISUAL_SPEC = /visual\.spec\.ts/

const behaviourProjects: Project[] = targets.flatMap((target) =>
	Object.entries(viewports).map(([device, viewport]) => ({
		name: `${target}-${device}`,
		testIgnore: VISUAL_SPEC,
		use: { baseURL: url(target), viewport },
	})),
)

const visualProjects: Project[] =
	targets.includes('next') && targets.includes('vue')
		? Object.entries(viewports).map(([device, viewport]) => ({
				name: `visual-${device}`,
				testMatch: VISUAL_SPEC,
				use: { viewport },
				metadata: { parity: { vue: url('vue'), next: url('next') } },
				// The expected images are this run's Vue screenshots, so they
				// live with the other test output, not in the repo.
				snapshotPathTemplate:
					'{testDir}/../../test-results/parity/{projectName}/{arg}{ext}',
			}))
		: []

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
		// SLOW_MO=300 pauses 300ms before each action, so a headed run can be
		// followed by eye (the *:headed scripts set it).
		launchOptions: { slowMo: Number(process.env.SLOW_MO ?? 0) },
	},
	projects: [...behaviourProjects, ...visualProjects],
	webServer: targets.map((target) => ({
		command: apps[target].command,
		cwd: apps[target].cwd,
		url: url(target),
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	})),
})
