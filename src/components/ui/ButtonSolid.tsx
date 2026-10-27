import type { MouseEventHandler } from 'react'
import { RouterLink } from '@/components/ui/RouterLink'
import { cx } from '@/lib/utils'

// Port of src/components/Buttons/button-solid.vue. Vue puts a parent's
// class, @click and data-test on the outer element automatically; here they
// are the className, onClick and data-test props. `to` takes an href:
// callers turn the original's named routes into paths.

interface ButtonSolidProps {
	content?: string
	color?: 'light' | 'dark'
	/** Extra classes for the inner <button>. */
	add?: string
	to?: string
	size?: 'small' | 'big'
	className?: string
	onClick?: MouseEventHandler<HTMLElement>
	'data-test'?: string
}

export function ButtonSolid({
	content = 'to product',
	color,
	add,
	to = '',
	size = 'big',
	className,
	onClick,
	'data-test': dataTest,
}: ButtonSolidProps) {
	const button = (
		<button
			className={cx(
				'rounded-sm border-2 uppercase tracking-wide text-k-black shadow-md transition duration-100 hover:translate-y-0.5 active:translate-y-1',
				color === 'light'
					? [
							'bg-k-main',
							'text-k-black',
							'border-k-main',
							'hover:border-k-black',
						]
					: ['bg-k-black', 'text-white', 'border-k-black', 'hover:text-k-main'],
				size == 'small'
					? ['w-40', 'py-3', 'text-sm', 'font-black']
					: ['w-52', 'py-3'],
				add,
			)}
		>
			{content}
		</button>
	)

	const outer = {
		className: cx('w-fit', className),
		onClick,
		'data-test': dataTest,
	}

	return to ? (
		<RouterLink href={to} {...outer}>
			{button}
		</RouterLink>
	) : (
		<div {...outer}>{button}</div>
	)
}
