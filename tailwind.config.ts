import type { Config } from 'tailwindcss'

// Theme copied verbatim from the Vue project's tailwind.config.js so both
// apps generate the same utility classes. See docs/adr/0003.
const config = {
	content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				Manrope: ['Manrope', 'sans-serif'],
			},
			colors: {
				'k-main': '#FFC700',
				'k-black': '#0E0E0E',
				'k-dark-grey': '#141414',
				'k-grey': '#F1F1F1',
				'k-light-grey': '#FAFAFA',
			},
			letterSpacing: {
				broad: '0.5em',
				broader: '0.75em',
				broadest: '1em',
			},
		},
	},
	plugins: [],
} satisfies Config

export default config
