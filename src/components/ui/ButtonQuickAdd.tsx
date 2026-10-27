// Port of src/components/Buttons/button-quick-add.vue. The Vue event
// addToCart becomes the onAddToCart prop. A parent's data-test replaces the
// button's own, as Vue's attribute fallthrough does.

interface ButtonQuickAddProps {
	onAddToCart?: () => void
	'data-test'?: string
}

export function ButtonQuickAdd({
	onAddToCart,
	'data-test': dataTest = 'button-quick-add',
}: ButtonQuickAddProps) {
	return (
		<button
			onClick={() => onAddToCart?.()}
			className="flex aspect-square h-full cursor-pointer flex-row items-center justify-center transition hover:translate-y-0.5"
			data-test={dataTest}
		>
			<img
				loading="lazy"
				className="aspect-square h-6 invert active:translate-y-0.5"
				src="/icons/cart-icon.svg"
				alt=""
			/>
			<p className="font-bold text-black">+</p>
		</button>
	)
}
