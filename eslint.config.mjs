import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	{
		rules: {
			// Plain <img> keeps markup and sizing identical to the Vue app.
			// See docs/adr/0005.
			'@next/next/no-img-element': 'off',
		},
	},
	// Must stay last: turns off rules that clash with Prettier.
	prettier,
	globalIgnores([
		'.next/**',
		'out/**',
		'build/**',
		'coverage/**',
		'playwright-report/**',
		'test-results/**',
		'next-env.d.ts',
	]),
])

export default eslintConfig
