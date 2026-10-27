// Port of src/components/Buttons/button-count.vue. The Vue events
// increaseCart and decreaseCart become the onIncreaseCart and onDecreaseCart
// props.

interface ButtonCountProps {
	itemCount: number
	onIncreaseCart?: () => void
	onDecreaseCart?: () => void
}

export function ButtonCount({
	itemCount,
	onIncreaseCart,
	onDecreaseCart,
}: ButtonCountProps) {
	return (
		<div className="flex flex-row items-center justify-center gap-3 lg:gap-4">
			<div
				onClick={onDecreaseCart}
				className="translate-all flex h-7 w-7 cursor-pointer flex-col justify-center rounded-full bg-gray-300 text-center font-semibold text-k-black duration-100 active:translate-y-0.5 active:opacity-100"
			>
				-
			</div>
			<p className="h-full text-center font-bold text-k-black">{itemCount}</p>
			<div
				onClick={onIncreaseCart}
				className="translate-all flex h-7 w-7 cursor-pointer flex-col justify-center rounded-full bg-gray-300 text-center font-semibold text-k-black duration-100 active:translate-y-0.5 active:opacity-100"
			>
				+
			</div>
		</div>
	)
}
