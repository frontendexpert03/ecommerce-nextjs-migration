import type { Config } from 'tailwindcss'

// Theme copied from the Vue project's tailwind.config.js so both apps
// generate the same utility classes (docs/adr/0003). The one change: the
// font family comes from next/font's variable (docs/adr/0010).
const config = {
	content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				Manrope: ['var(--font-manrope)', 'sans-serif'],
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
