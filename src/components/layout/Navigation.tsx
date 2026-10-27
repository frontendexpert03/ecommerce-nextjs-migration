'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { CartModal } from '@/components/cart/CartModal'
import { Fade } from '@/components/ui/Fade'
import { RouterLink } from '@/components/ui/RouterLink'
import { cx } from '@/lib/utils'
import { selectCartLength, useCartStore } from '@/store/cart-store'

// Port of src/components/navigation-global.vue.

// The original builds 'bg-' + color at runtime. Tailwind only generates
// classes it finds written out, so the full names are listed here.
const BACKGROUNDS = {
	black: 'bg-black',
	transparent: 'bg-transparent',
	'k-black': 'bg-k-black',
}

const LINKS = [
	{ href: '/', label: 'Home', name: 'home' },
	{ href: '/keyboards', label: 'Keyboards', name: 'keyboards' },
	{ href: '/keycaps', label: 'Keycaps', name: 'keycaps' },
	{ href: '/deskmats', label: 'Deskmats', name: 'deskmats' },
]

interface NavigationProps {
	color?: keyof typeof BACKGROUNDS
}

export function Navigation({ color = 'transparent' }: NavigationProps) {
	const pathname = usePathname()
	const cartLength = useCartStore(selectCartLength)
	const showCart = useCartStore((state) => state.showCart)
	const cartOn = useCartStore((state) => state.cartOn)
	const [hamburgerState, setHamburgerState] = useState<'show' | 'hide'>('hide')

	const showHamburger = () => setHamburgerState('show')
	const hideHamburger = () => setHamburgerState('hide')

	return (
		<header
			id="navi"
			className={cx(
				'main-container flex h-full w-screen flex-col items-center',
				BACKGROUNDS[color],
			)}
			data-test="nav-desktop"
		>
			<div className="relative flex w-4/5 max-w-6xl flex-row items-center justify-between border-b border-zinc-500 py-6 md:w-11/12 lg:w-4/5">
				<button
					id="hamburger"
					className="select-none lg:hidden"
					onClick={showHamburger}
					data-test="hamburger"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="2"
						stroke="currentColor"
						className="h-8 w-8"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
						/>
					</svg>
				</button>
				<RouterLink
					href="/"
					className="text-3xl font-extrabold tracking-tight antialiased transition duration-300 hover:scale-110 hover:text-k-main"
					data-test="nav-logo"
				>
					KIIIBS
				</RouterLink>

				<nav className="hidden tracking-widest lg:flex lg:gap-8">
					{LINKS.map(({ href, label, name }) => (
						<RouterLink
							key={href}
							href={href}
							className="uppercase text-white transition duration-300 hover:text-k-main active:translate-y-0.5"
							data-test={`nav-${name}`}
						>
							{label}
						</RouterLink>
					))}
				</nav>
				<div
					className="relative h-5 cursor-pointer"
					onClick={cartOn}
					data-test="cart-button"
				>
					<img
						className="h-full hover:opacity-50 active:translate-y-0.5"
						src="/icons/cart-icon.svg"
						alt=""
					/>
					<Fade show={cartLength !== 0}>
						<div
							className="absolute -right-2 top-3 flex h-4 w-4 flex-col items-center justify-center rounded-full bg-red-600 text-xs font-black transition-all duration-300"
							data-test="cart-bubble"
						>
							{cartLength}
						</div>
					</Fade>
				</div>
			</div>
			<CartModal show={showCart} />
			<Fade show={hamburgerState === 'show'} mode="if">
				<nav
					className={cx(
						'absolute flex w-screen flex-row justify-around gap-2 bg-black p-9 text-xs font-semibold tracking-widest',
						pathname === '/' ? 'bg-k-black' : 'bg-black',
					)}
					data-test="nav-mobile"
				>
					<button
						className="lg:text-md uppercase text-white transition duration-300 hover:text-k-main active:translate-y-0.5 md:text-lg"
						onClick={hideHamburger}
						data-test="close-hamburger"
					>
						Close
					</button>
					{/* The link to the current page is hidden. */}
					{LINKS.map(({ href, label, name }) => (
						<RouterLink
							key={href}
							href={href}
							className={cx(
								'lg:text-md uppercase text-white transition duration-300 hover:text-k-main active:translate-y-0.5 md:text-lg',
								pathname === href && 'hidden',
							)}
							onClick={hideHamburger}
							data-test={`mobile-nav-${name}`}
						>
							{label}
						</RouterLink>
					))}
				</nav>
			</Fade>
		</header>
	)
}
