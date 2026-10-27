// Port of src/pages/Product/Components/product-image-grid.vue. It renders
// only when all three images are set.

interface ProductImageGridProps {
	topSrc: string
	botSrc: string
	rightSrc: string
}

export function ProductImageGrid({
	topSrc,
	botSrc,
	rightSrc,
}: ProductImageGridProps) {
	if (!(topSrc && botSrc && rightSrc)) return null

	return (
		<section className="mt-16 flex h-full w-full flex-col items-center bg-white lg:mt-32">
			<div className="flex w-4/5 max-w-6xl flex-col gap-3 lg:grid lg:max-h-[40rem] lg:grid-cols-7 lg:grid-rows-2 lg:gap-5">
				<img
					loading="lazy"
					className="col-span-3 col-start-1 row-span-1 row-start-1 aspect-video h-full w-full rounded-md object-cover lg:aspect-auto"
					src={topSrc}
					alt=""
				/>
				<img
					loading="lazy"
					className="col-span-3 col-start-1 row-span-1 row-start-2 aspect-video h-full w-full rounded-md object-cover lg:aspect-auto"
					src={botSrc}
					alt=""
				/>
				<img
					loading="lazy"
					className="order-first col-span-4 col-start-4 row-start-1 row-end-3 aspect-square h-full w-full rounded-md object-cover lg:order-none lg:aspect-auto"
					src={rightSrc}
					alt=""
				/>
			</div>
		</section>
	)
}
