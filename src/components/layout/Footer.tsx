import { RouterLink } from '@/components/ui/RouterLink'

// Port of src/components/footer-global.vue. The social links have an empty
// href, as in the original, so they reload the current page. "you setup" is
// the original's typo.

const LINKS = [
	{ href: '/', label: 'Home' },
	{ href: '/keyboards', label: 'Keyboards' },
	{ href: '/keycaps', label: 'Keycaps' },
	{ href: '/deskmats', label: 'Deskmats' },
]

// The labels name the icon-only links for screen readers; the original
// has none (docs/adr/0016).
const SOCIAL_LINKS = [
	{ icon: '/icons/facebook.svg', label: 'Facebook' },
	{ icon: '/icons/twitter.svg', label: 'Twitter' },
	{ icon: '/icons/instagram.svg', label: 'Instagram' },
]

export function Footer() {
	return (
		<footer className="relative mt-20 flex h-full w-screen flex-col items-center bg-black md:mt-32 lg:mt-40">
			<div className="flex w-4/5 flex-row justify-center md:w-11/12 md:max-w-6xl md:justify-start lg:w-4/5">
				<div
					id="colorStrip"
					className="absolute top-0 h-1 w-20 max-w-6xl bg-k-main"
				></div>
			</div>
			<div
				id="container"
				className="my-10 flex h-full w-4/5 max-w-6xl flex-col justify-center md:w-11/12 lg:w-4/5"
			>
				<div
					id="titleNav"
					className="mb-10 flex flex-col items-center justify-between md:flex-row"
				>
					<RouterLink
						href="/"
						className="mb-8 cursor-pointer text-4xl font-bold text-white subpixel-antialiased transition duration-300 hover:scale-110 hover:text-k-main md:mb-0 md:text-3xl"
					>
						KIIIBS
					</RouterLink>
					<nav className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start md:gap-10">
						{LINKS.map(({ href, label }) => (
							<RouterLink
								key={href}
								className="font-semibold uppercase tracking-wider text-white transition duration-300 hover:text-k-main"
								href={href}
							>
								{label}
							</RouterLink>
						))}
					</nav>
				</div>
				<div
					id="textSocials"
					className="flex flex-col items-center justify-between md:flex-row md:items-start"
				>
					<p className="mb-10 text-center tracking-wide opacity-70 md:mb-0 md:w-2/3 md:text-left">
						KIIIBS is an all in one stop to fulfill your mechanical keyboard
						needs. We&apos;re a small team of coding lovers and typing
						specialists who are devoted to helping you get the most out of you
						setup. Come and visit our demo facility - we&apos;re open 7 days a
						week.
					</p>
					<nav className="flex flex-row gap-4 md:self-end">
						{SOCIAL_LINKS.map(({ icon, label }) => (
							<a
								key={icon}
								aria-label={label}
								className="transition duration-300 hover:-translate-y-0.5"
								href=""
							>
								<img
									loading="lazy"
									className="aspect-square h-6"
									src={icon}
									alt=""
								/>
							</a>
						))}
					</nav>
				</div>
				<p className="mt-16 text-center text-sm font-semibold tracking-wide text-white opacity-60 md:text-start">
					Copyright 2023. All Rights Reserved
				</p>
			</div>
		</footer>
	)
}
