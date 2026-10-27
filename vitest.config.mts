import { existsSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import {
	defineConfig,
	type Plugin,
	type TestProjectInlineConfiguration,
} from 'vitest/config'

// The original Vue app, used read-only as the reference for the contract
// tests (docs/adr/0009). Same default as playwright.config.ts.
const VUE_APP_DIR =
	process.env.VUE_APP_DIR ??
	path.resolve(import.meta.dirname, '../E-Commerce-Store')
const hasVueApp = existsSync(path.join(VUE_APP_DIR, 'src'))

if (!hasVueApp) {
	console.warn(
		`Vue app not found at ${VUE_APP_DIR}, so the "vue" test project is skipped.`,
	)
}

// Each contract test runs once per project; the @contract-target alias picks
// the adapter for that project's app.
const contracts = 'tests/contracts/specs/**/*.contract.test.ts'
const adapter = (name: 'next' | 'vue') =>
	path.resolve(import.meta.dirname, `tests/contracts/${name}/target.ts`)

const nextProject: TestProjectInlineConfiguration = {
	plugins: [react()],
	resolve: {
		tsconfigPaths: true,
		alias: { '@contract-target': adapter('next') },
	},
	test: {
		name: 'next',
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		include: ['src/**/*.test.{ts,tsx}', contracts],
	},
}

// The Vue app imports images from its public/ folder by URL
// (`import bannerImage from '/icons/KIIIBS-banner.png'` in src/data/meta.ts).
// Vite's build replaces each import with that same URL string, so the tests
// do the same instead of trying to load the image as a module.
const PUBLIC_ASSET = '\0public-asset:'
const vuePublicAssets: Plugin = {
	name: 'vue-public-assets',
	enforce: 'pre',
	resolveId(id) {
		if (
			id.startsWith('/') &&
			existsSync(path.join(VUE_APP_DIR, 'public', id))
		) {
			return PUBLIC_ASSET + id
		}
	},
	load(id) {
		if (id.startsWith(PUBLIC_ASSET)) {
			return `export default ${JSON.stringify(id.slice(PUBLIC_ASSET.length))}`
		}
	},
}

const vueProject: TestProjectInlineConfiguration = {
	plugins: [vuePublicAssets, vue()],
	resolve: {
		alias: {
			'@contract-target': adapter('vue'),
			'@vue-app': path.join(VUE_APP_DIR, 'src'),
		},
		// The Vue sources live outside this repo, so their imports would
		// resolve from the Vue app's node_modules and load a second copy of
		// Vue next to the one @testing-library/vue uses. Dedupe makes them use
		// this repo's copies, pinned to the Vue app's lockfile versions.
		dedupe: ['vue', 'pinia', '@vueuse/core'],
	},
	test: {
		name: 'vue',
		environment: 'jsdom',
		setupFiles: ['./tests/contracts/vue/setup.ts'],
		include: [contracts],
	},
}

export default defineConfig({
	test: {
		projects: hasVueApp ? [nextProject, vueProject] : [nextProject],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
			reporter: ['text', 'html', 'lcov'],
		},
	},
})
