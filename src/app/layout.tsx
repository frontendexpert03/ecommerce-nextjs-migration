import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { CartSync } from '@/components/cart/CartSync'
import './globals.css'

// The Vue app loads Manrope from Google Fonts at runtime; next/font
// self-hosts the same font. Tailwind's font-Manrope reads the variable.
// See docs/adr/0010.
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

// From the Vue app's index.html: shown until a page sets its own title.
export const metadata: Metadata = {
	title: 'KIIBS Mechanical Keyboards',
	icons: { icon: '/icons/KIIIBS.png' },
}

// The wrapper <div> is the Vue app's App.vue.
export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html lang="en" className={manrope.variable}>
			<body>
				<CartSync />
				<div className="select-none font-Manrope">{children}</div>
			</body>
		</html>
	)
}
