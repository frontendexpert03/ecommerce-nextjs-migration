import type { BoxContent } from '@/lib/types'

// Port of src/pages/Product/Components/product-features.vue.

interface ProductFeaturesProps {
	features: string
	inthebox: BoxContent[]
}

export function ProductFeatures({ features, inthebox }: ProductFeaturesProps) {
	return (
		<section className="mt-16 flex w-4/5 max-w-6xl flex-col lg:mt-32 lg:grid lg:grid-cols-2 lg:grid-rows-1">
			<div className="flex h-full w-full flex-col">
				<h2 className="mb-8 text-2xl font-bold tracking-wide text-black">
					FEATURES
				</h2>
				<p className="tracking-wide text-black opacity-60">{features}</p>
			</div>
			<div className="mt-16 flex h-full w-full flex-col lg:ml-24 lg:mt-0">
				<h2 className="mb-8 text-2xl font-bold tracking-wide text-black">
					IN THE BOX
				</h2>
				{inthebox.map((item, index) => (
					<div key={index} className="flex flex-row items-baseline gap-4">
						<p className="font-bold tracking-wide text-k-main">{item.count}x</p>
						<p className="tracking-wide text-black opacity-60">
							{item.content}
						</p>
					</div>
				))}
			</div>
		</section>
	)
}
