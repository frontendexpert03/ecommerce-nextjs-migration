import { RouterLink } from '@/components/ui/RouterLink'
import { cx } from '@/lib/utils'

// Port of src/components/Buttons/button-empty.vue.

interface ButtonEmptyProps {
	content?: string
	/** Extra classes for the inner <button>. */
	add?: string
	to?: string
}

export function ButtonEmpty({
	content = 'to product',
	add,
	to = '/',
}: ButtonEmptyProps) {
	return (
		<RouterLink href={to}>
			<button
				className={cx(
					'w-52 border-2 border-k-black px-10 py-3 font-bold uppercase tracking-wide text-k-black transition duration-100 hover:translate-y-0.5 hover:shadow-md active:translate-y-1',
					add,
				)}
			>
				{content}
			</button>
		</RouterLink>
	)
}
