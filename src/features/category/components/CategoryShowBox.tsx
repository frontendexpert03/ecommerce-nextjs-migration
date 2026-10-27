'use client'

import { ButtonQuickAdd } from '@/components/ui/ButtonQuickAdd'
import { ButtonSolid } from '@/components/ui/ButtonSolid'
import { RouterLink } from '@/components/ui/RouterLink'
import { productHref } from '@/lib/routes'
import type { Product } from '@/lib/types'
import { cx } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'

// Port of src/pages/Category/Components/category-show-box.vue. Products with
// odd ids show their text on the left. The original's unused `show` ref is
// not ported.

interface CategoryShowBoxProps {
	category: string
	item: Product
	'data-test'?: string
}

export function CategoryShowBox({
	category,
	item,
	'data-test': dataTest,
}: CategoryShowBoxProps) {
	const showQuickAdd = useCartStore((state) => state.showQuickAdd)
	const addToCart = useCartStore((state) => state.addToCart)
	const flip = item.id % 2 === 0 ? false : true
	const href = productHref(category, item.id)

	return (
		<div
			className="mt-16 flex w-4/5 max-w-6xl flex-col items-center gap-10 md:mt-32 md:grid md:w-11/12 md:grid-cols-2 md:grid-rows-1 md:gap-10 lg:w-4/5 lg:gap-20"
			data-test={dataTest}
		>
			<div
				className={cx(
					'flex flex-col items-center md:col-span-1 md:row-start-1 md:block lg:pb-6',
					flip === true ? 'md:col-start-1' : 'md:col-start-2',
				)}
			>
				{item.nu && (
					<p className="md:text-md text-sm font-light uppercase tracking-broad text-black">
						new product
					</p>
				)}
				<h1 className="mt-4 text-center text-4xl font-semibold uppercase text-black md:text-start md:text-5xl lg:text-6xl">
					{`${item.header} `}
					<br className="hidden md:block" />
					{` ${item.subheader}`}
				</h1>
				<p className="mb-10 mt-4 text-center text-black opacity-60 md:pr-20 md:text-start">
					{item.text}
				</p>
				<div className="flex flex-row items-center justify-center gap-4 md:justify-normal">
					<ButtonSolid to={href} color="light" add="font-bold" />
					{showQuickAdd && (
						<ButtonQuickAdd
							onAddToCart={() => addToCart(item)}
							data-test={`quick-add-${item.category}-${item.id}`}
						/>
					)}
				</div>
			</div>
			<RouterLink
				href={href}
				className={cx(
					'order-first col-span-1 cursor-pointer overflow-hidden rounded active:translate-y-1 md:-order-none',
					flip === true ? 'col-start-2' : 'col-start-1',
				)}
			>
				<img
					loading="lazy"
					className="relative aspect-square w-full object-cover"
					src={item.src}
					alt=""
				/>
			</RouterLink>
		</div>
	)
}
