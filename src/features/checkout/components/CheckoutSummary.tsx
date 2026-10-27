'use client'

import { ButtonSolid } from '@/components/ui/ButtonSolid'
import { CheckoutSummaryItem } from '@/features/checkout/components/CheckoutSummaryItem'
import { cx } from '@/lib/utils'
import {
	FREE_SHIPPING_THRESHOLD,
	SHIPPING,
	selectCartValue,
	selectGrandTotal,
	selectVat,
	useCartStore,
} from '@/store/cart-store'
import { useFormStore } from '@/store/form-store'

// Port of src/pages/Checkout/Components/checkout-summary.vue. Shipping is
// struck through, not removed, once it is free.

export function CheckoutSummary() {
	const cart = useCartStore((state) => state.cart)
	const cartValue = useCartStore(selectCartValue)
	const vat = useCartStore(selectVat)
	const grandTotal = useCartStore(selectGrandTotal)
	const submit = useFormStore((state) => state.submit)

	return (
		<div
			className="col-span-1 flex h-fit max-h-full w-full flex-col rounded bg-white px-6 py-12 lg:self-start lg:px-10"
			data-test="checkout-summary"
		>
			<h1 className="text-2xl font-bold uppercase text-black">Summary</h1>
			<div className="my-10 flex h-full w-full flex-col gap-5 overflow-x-hidden overflow-y-scroll">
				{Object.values(cart).map((value, index) => (
					<CheckoutSummaryItem
						key={index}
						cartItem={value.product}
						itemCount={value.amount}
					/>
				))}
			</div>
			<div className="flex flex-row justify-between">
				<p className="font-semibold tracking-wide text-black text-opacity-60">
					TOTAL
				</p>
				<p className="text-lg font-bold text-black">{`$${cartValue}`}</p>
			</div>
			<div className="flex flex-row justify-between">
				<p className="font-semibold tracking-wide text-black text-opacity-60">
					SHIPPING
				</p>
				<p
					className={cx(
						'text-lg font-bold text-black',
						cartValue > FREE_SHIPPING_THRESHOLD && 'line-through',
					)}
				>
					{`$${SHIPPING}`}
				</p>
			</div>
			<div className="flex flex-row justify-between">
				<p className="font-semibold tracking-wide text-black text-opacity-60">
					VAT (INCLUDED)
				</p>
				<p className="text-lg font-bold text-black">{`$${vat}`}</p>
			</div>
			<div className="mt-4 flex flex-row justify-between">
				<p className="font-black tracking-wide text-black">GRAND TOTAL</p>
				<p className="text-lg font-bold text-black">{`$${grandTotal}`}</p>
			</div>
			<ButtonSolid
				content="continue & pay"
				color="light"
				className="mt-8 self-center font-bold"
				onClick={() => submit()}
				data-test="checkout-button"
			/>
		</div>
	)
}
