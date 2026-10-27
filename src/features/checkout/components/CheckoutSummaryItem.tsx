import type { Product } from '@/lib/types'

// Port of src/pages/Checkout/Components/checkout-summary-item.vue.

interface CheckoutSummaryItemProps {
	cartItem: Product
	itemCount: number
}

export function CheckoutSummaryItem({
	cartItem,
	itemCount,
}: CheckoutSummaryItemProps) {
	if (!(itemCount > 0)) return null

	return (
		<div className="flex h-full w-full flex-row items-center justify-start gap-3">
			<div className="basis-1/4 justify-self-start overflow-hidden rounded-lg">
				<img
					className="aspect-square h-fit w-fit object-cover shadow-md"
					src={cartItem.src}
					alt=""
				/>
			</div>
			<div className="flex basis-2/4 flex-col items-start">
				<p className="text-start text-lg font-bold text-k-black">
					{cartItem.header}
				</p>
				<p className="text-md text-start font-bold text-k-black opacity-80">
					{`$ ${cartItem.price}`}
				</p>
			</div>

			<div className="ml-auto justify-self-end text-lg font-bold text-black opacity-50">
				{`x${itemCount}`}
			</div>
		</div>
	)
}
