'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'
import { cx } from '@/lib/utils'

// Port of vue-router's <router-link> as the original uses it. On the page it
// points to, a link gets the classes router-link-active and
// router-link-exact-active and aria-current="page". The original's routes
// are flat, so "active" and "exact active" both mean "same path". Like
// <router-link>, it always renders a class attribute, even an empty one.

type RouterLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
	href: string
}

export function RouterLink({ href, className, ...props }: RouterLinkProps) {
	const active = usePathname() === href

	return (
		<Link
			href={href}
			aria-current={active ? 'page' : undefined}
			className={cx(
				active && 'router-link-active router-link-exact-active',
				className,
			)}
			{...props}
		/>
	)
}
