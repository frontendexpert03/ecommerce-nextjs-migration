'use client'

import { CartItem } from '@/components/cart/CartItem'
import { ButtonSolid } from '@/components/ui/ButtonSolid'
import { Fade } from '@/components/ui/Fade'
import {
	selectCartLength,
	selectCartValue,
	useCartStore,
} from '@/store/cart-store'

// Port of src/components/Cart/cart-modal.vue. The navigation shows it with
// v-show="cartStore.showCart"; here that is the `show` prop.

export function CartModal({ show }: { show: boolean }) {
	const cart = useCartStore((state) => state.cart)
	const cartOff = useCartStore((state) => state.cartOff)
	const clearCart = useCartStore((state) => state.clearCart)
	const cartLength = useCartStore(selectCartLength)
	const cartValue = useCartStore(selectCartValue)

	return (
		<Fade show={show}>
			<div
				className="fixed z-50 flex h-screen w-full flex-col items-center backdrop-blur-sm lg:block lg:items-start"
				data-test="cart-modal"
			>
				<div
					onClick={cartOff}
					className="absolute h-screen w-full bg-black opacity-40 lg:relative"
					data-test="cart-background"
				></div>
				<div className="relative mt-16 flex h-full max-h-[80%] w-11/12 max-w-[32rem] flex-col items-center rounded-lg bg-white opacity-100 lg:absolute lg:right-10 lg:top-10 lg:mt-0 lg:w-1/3">
					<button
						onClick={cartOff}
						className="mb-4 mt-8 cursor-pointer self-start px-6 font-semibold text-black opacity-60 lg:px-10"
						data-test="cart-close-button"
					>
						Close
					</button>
					<div className="mb-8 flex w-full flex-row items-end justify-between px-6 lg:px-10">
						<p
							className="font-Manrope text-2xl font-bold text-k-black lg:text-3xl"
							data-test="cart-header"
						>
							{`CART (${cartLength})`}
						</p>
						<p
							onClick={clearCart}
							className="cursor-pointer text-k-dark-grey underline opacity-70 transition hover:opacity-100 active:translate-y-0.5"
							data-test="cart-delete-all"
						>
							Delete All
						</p>
					</div>
					{cartLength === 0 && (
						<div
							className="text-lg text-black opacity-60 lg:text-xl"
							data-test="cart-empty-message"
						>
							No items in cart.
						</div>
					)}
					<div
						className="mb-10 flex h-full w-full flex-col gap-5 overflow-y-scroll"
						data-test="cart-item-container"
					>
						{Object.values(cart).map((value, index) => (
							<CartItem
								key={index}
								cartItem={value.product}
								itemCount={value.amount}
							/>
						))}
					</div>
					<div
						className="mb-6 flex w-full flex-row justify-between px-6 lg:px-10"
						data-test="cart-total-section"
					>
						<p className="text-xl font-semibold text-black opacity-50 lg:text-2xl">
							TOTAL
						</p>
						<p className="text-2xl font-bold text-black">{`$${cartValue}`}</p>
					</div>
					{!(cartLength === 0) && (
						<ButtonSolid
							to="/checkout"
							className="mb-10"
							add="font-bold"
							color="light"
							content="Checkout"
							onClick={cartOff}
							data-test="cart-checkout-button"
						/>
					)}
				</div>
			</div>
		</Fade>
	)
}
